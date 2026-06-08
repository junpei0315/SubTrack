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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMonthlyTotal = useCallback(async () => {
    const now = new Date();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await getMonthlyBillingTotal(
        subscriptionRepositorySupabase,
        now.getFullYear(),
        now.getMonth() + 1
      );
      setTotal(result);
    } catch {
      setTotal(EMPTY_TOTAL);
      setErrorMessage('合計支出の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (period === 'month') {
      void loadMonthlyTotal();
      return;
    }
    // 年間集計は未実装。月間データを残したままだと誤情報になるためリセットする。
    setTotal(EMPTY_TOTAL);
    setErrorMessage(null);
    setIsLoading(false);
  }, [period, loadMonthlyTotal]);

  return {
    period,
    setPeriod,
    total,
    isLoading,
    errorMessage,
  };
}
