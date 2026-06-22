import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useAuth } from '@/components/auth/AuthProvider';
import { getExchangeRates } from '@/src/application/getExchangeRates';
import {
  convertToJpy,
  createFallbackExchangeRateSnapshot,
  EXCHANGE_RATE_STALE_MESSAGE,
  formatDisplayPrice,
  type ExchangeRates,
} from '@/src/domain/exchangeRate';
import { fxRateRepositorySupabase } from '@/src/infrastructure/supabase/fxRateRepositorySupabase';

interface ExchangeRateContextValue {
  rates: ExchangeRates | null;
  isLoading: boolean;
  isStale: boolean;
  staleMessage: string | null;
  formatInJpy: (amount: number, fromCurrency: string) => string;
  convertInJpy: (amount: number, fromCurrency: string) => number | null;
}

const ExchangeRateContext = createContext<ExchangeRateContextValue | null>(null);

export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!session) {
      setRates(null);
      setIsStale(false);
      setIsLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    void getExchangeRates(fxRateRepositorySupabase)
      .then((snapshot) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setRates(snapshot.rates);
        setIsStale(snapshot.isStale);
      })
      .catch(() => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setRates(createFallbackExchangeRateSnapshot().rates);
        setIsStale(true);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      });
  }, [session]);

  const formatInJpy = useCallback(
    (amount: number, fromCurrency: string) => formatDisplayPrice(amount, fromCurrency, rates),
    [rates]
  );

  const convertInJpy = useCallback(
    (amount: number, fromCurrency: string) => {
      if (!rates) {
        return null;
      }
      return convertToJpy(amount, fromCurrency, rates);
    },
    [rates]
  );

  const value = useMemo<ExchangeRateContextValue>(
    () => ({
      rates,
      isLoading,
      isStale,
      staleMessage: isStale ? EXCHANGE_RATE_STALE_MESSAGE : null,
      formatInJpy,
      convertInJpy,
    }),
    [rates, isLoading, isStale, formatInJpy, convertInJpy]
  );

  return <ExchangeRateContext.Provider value={value}>{children}</ExchangeRateContext.Provider>;
}

export function useExchangeRates(): ExchangeRateContextValue {
  const context = useContext(ExchangeRateContext);
  if (!context) {
    throw new Error('useExchangeRates must be used within ExchangeRateProvider');
  }
  return context;
}
