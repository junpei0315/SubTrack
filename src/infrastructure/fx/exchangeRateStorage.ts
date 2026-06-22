import AsyncStorage from '@react-native-async-storage/async-storage';

import type { ExchangeRates } from '@/src/domain/exchangeRate';

const STORAGE_KEY = 'subtrack:exchange_rates:v1';

export interface StoredExchangeRates {
  rates: ExchangeRates;
  savedAt: string;
}

export async function loadStoredExchangeRates(): Promise<StoredExchangeRates | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredExchangeRates;
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
