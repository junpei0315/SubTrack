import { useCallback, useEffect, useState } from 'react';

import { getMonthlyBillingTotal } from '@/src/application/getMonthlyBillingTotal';
import type { MonthlyBillingTotal } from '@/src/domain/billingTotals';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

export type SpendingPeriod = 'month' | 'year';

const EMPTY_TOTAL: MonthlyBillingTotal = { amount: 0, currency: 'JPY', count: 0 };

export function useMonthlySpending() {
  const [period, setPeriod] = useState<SpendingPeriod>('month');
  const [total, setTotal] = useState<MonthlyBillingTotal>(EMPTY_TOTAL);
  const [isLoading, setIsLoading] = useState(true);

  const loadMonthlyTotal = useCallback(async () => {
    const now = new Date();
    setIsLoading(true);
    try {
      const result = await getMonthlyBillingTotal(
        subscriptionRepositorySupabase,
        now.getFullYear(),
        now.getMonth() + 1
      );
      setTotal(result);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // 年間集計は未実装のため、当面は月間のみ取得する。
    if (period === 'month') {
      void loadMonthlyTotal();
    }
  }, [period, loadMonthlyTotal]);

  return {
    period,
    setPeriod,
    total,
    isLoading,
  };
}
