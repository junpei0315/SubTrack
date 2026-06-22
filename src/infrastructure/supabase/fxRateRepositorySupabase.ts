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

async function fetchFromFrankfurter(): Promise<ExchangeRates> {
  const response = await fetch(FRANKFURTER_LATEST_URL);
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
  const { data, error } = await supabase.functions.invoke<FxRatesEdgeResponse>('fx-rates');
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
  } catch {
    try {
      const rates = await fetchFromFrankfurter();
      await persistRates(rates);
      return { rates, isStale: false };
    } catch {
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
