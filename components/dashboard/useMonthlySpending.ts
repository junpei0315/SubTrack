import { useCallback, useEffect, useState } from 'react';

import { getActiveBillingTotal } from '@/src/application/getActiveBillingTotal';
import type { BillingTotal } from '@/src/domain/billingTotals';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

export type SpendingPeriod = 'month' | 'year';

const EMPTY_TOTAL: BillingTotal = { amount: 0, currency: 'JPY', count: 0 };

export function useMonthlySpending() {
  const [period, setPeriod] = useState<SpendingPeriod>('month');
  const [total, setTotal] = useState<BillingTotal>(EMPTY_TOTAL);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadTotal = useCallback(async (targetPeriod: SpendingPeriod) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await getActiveBillingTotal(subscriptionRepositorySupabase, targetPeriod);
      setTotal(result);
    } catch {
      setTotal(EMPTY_TOTAL);
      setErrorMessage('合計支出の取得に失敗しました');
    } finally {
      setIsLoading(false);
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
