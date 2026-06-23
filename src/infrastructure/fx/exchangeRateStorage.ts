import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ExchangeRates } from '@/src/domain/exchangeRate';

const STORAGE_KEY = 'subtrack:exchange_rates:v1';

export interface StoredExchangeRates {
  rates: ExchangeRates;
  savedAt: string;
}

function isValidExchangeRates(value: unknown): value is ExchangeRates {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as ExchangeRates;
  if (typeof candidate.asOfDate !== 'string' || candidate.asOfDate.length === 0) {
    return false;
  }

  if (!candidate.toJpy || typeof candidate.toJpy !== 'object') {
    return false;
  }

  for (const [currency, rate] of Object.entries(candidate.toJpy)) {
    if (typeof currency !== 'string' || typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      return false;
    }
  }

  return candidate.toJpy.JPY === 1;
}

function isValidStoredExchangeRates(value: unknown): value is StoredExchangeRates {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as StoredExchangeRates;
  return typeof candidate.savedAt === 'string' && isValidExchangeRates(candidate.rates);
}

export async function loadStoredExchangeRates(): Promise<StoredExchangeRates | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isValidStoredExchangeRates(parsed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function saveStoredExchangeRates(rates: ExchangeRates): Promise<void> {
  const payload: StoredExchangeRates = {
    rates,
    savedAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}
