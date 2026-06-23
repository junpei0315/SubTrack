import { useCallback, useEffect, useRef, useState } from 'react';

import { getActiveBillingTotal } from '@/src/application/getActiveBillingTotal';
import type { BillingTotal } from '@/src/domain/billingTotals';
import { fxRateRepositorySupabase } from '@/src/infrastructure/supabase/fxRateRepositorySupabase';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

export type SpendingPeriod = 'month' | 'year';

const EMPTY_TOTAL: BillingTotal = { amount: 0, currency: 'JPY', count: 0 };

export function useMonthlySpending() {
  const [period, setPeriod] = useState<SpendingPeriod>('month');
  const [total, setTotal] = useState<BillingTotal>(EMPTY_TOTAL);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadTotal = useCallback(async (targetPeriod: SpendingPeriod) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await getActiveBillingTotal(
        subscriptionRepositorySupabase,
        fxRateRepositorySupabase,
        targetPeriod
      );
      if (requestId === requestIdRef.current) {
        setTotal(result);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        setTotal(EMPTY_TOTAL);
        if (__DEV__) {
          console.error('[useMonthlySpending] load failed', error);
        }
        setErrorMessage('合計支出の取得に失敗しました');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadTotal(period);
  }, [period, loadTotal]);

  return {
    period,
    setPeriod,
    total,
    isLoading,
    errorMessage,
  };
}
