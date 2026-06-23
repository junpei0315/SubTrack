/**
 * 為替レート取得（F-13）。
 * 優先: Supabase Edge Function → Frankfurter 直接 → AsyncStorage キャッシュ
 */

import {
  buildToJpyRatesFromEurBase,
  createFallbackExchangeRateSnapshot,
  type ExchangeRates,
  type ExchangeRateSnapshot,
} from '@/src/domain/exchangeRate';
import type { FxRateRepository } from '@/src/ports/fxRateRepository';

import { supabase } from './client';
import { loadStoredExchangeRates, saveStoredExchangeRates } from '../fx/exchangeRateStorage';

const FRANKFURTER_LATEST_URL = 'https://api.frankfurter.app/latest';
const CLIENT_REFRESH_MS = 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

let memorySnapshot: ExchangeRateSnapshot | null = null;
let memoryFetchedAt = 0;
let inFlight: Promise<ExchangeRateSnapshot> | null = null;

interface FrankfurterLatestResponse {
  date: string;
  rates: Record<string, number>;
}

interface FxRatesEdgeResponse {
  rates: ExchangeRates;
  cached?: boolean;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function fetchFromFrankfurter(): Promise<ExchangeRates> {
  const response = await fetchWithTimeout(FRANKFURTER_LATEST_URL, FETCH_TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`Frankfurter API failed: ${response.status}`);
  }

  const data = (await response.json()) as FrankfurterLatestResponse;
  return {
    toJpy: buildToJpyRatesFromEurBase(data.rates),
    asOfDate: data.date,
  };
}

async function fetchFromEdgeFunction(): Promise<ExchangeRates> {
  const { data, error } = await withTimeout(
    supabase.functions.invoke<FxRatesEdgeResponse>('fx-rates'),
    FETCH_TIMEOUT_MS
  );
  if (error) {
    throw error;
  }
  if (!data?.rates?.toJpy || !data.rates.asOfDate) {
    throw new Error('fx-rates returned invalid payload');
  }
  return data.rates;
}

async function persistRates(rates: ExchangeRates): Promise<void> {
  try {
    await saveStoredExchangeRates(rates);
  } catch {
    // ストレージ書き込み失敗でもレート自体は使える
  }
}

async function resolveFreshRates(): Promise<ExchangeRateSnapshot> {
  try {
    const rates = await fetchFromEdgeFunction();
    await persistRates(rates);
    return { rates, isStale: false };
  } catch (edgeError) {
    if (__DEV__) {
      console.warn('[fx] Edge Function failed, trying Frankfurter', edgeError);
    }
    try {
      const rates = await fetchFromFrankfurter();
      await persistRates(rates);
      return { rates, isStale: false };
    } catch (directError) {
      if (__DEV__) {
        console.warn('[fx] Frankfurter direct failed, using cache/fallback', directError);
      }
      const stored = await loadStoredExchangeRates();
      if (stored) {
        return { rates: stored.rates, isStale: true };
      }
      return createFallbackExchangeRateSnapshot();
    }
  }
}

async function getRatesInternal(): Promise<ExchangeRateSnapshot> {
  const now = Date.now();
  if (memorySnapshot && now - memoryFetchedAt < CLIENT_REFRESH_MS) {
    return memorySnapshot;
  }

  if (inFlight) {
    return inFlight;
  }

  inFlight = resolveFreshRates()
    .then((snapshot) => {
      memorySnapshot = snapshot;
      memoryFetchedAt = Date.now();
      return snapshot;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export const fxRateRepositorySupabase: FxRateRepository = {
  getRates: getRatesInternal,
};
