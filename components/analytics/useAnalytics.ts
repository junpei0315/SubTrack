import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/components/auth/AuthProvider';
import { getGenreSpendingBreakdown } from '@/src/application/getGenreSpendingBreakdown';
import { getMonthlySpendingTrend } from '@/src/application/getMonthlySpendingTrend';
import { getUnusedSubscriptionAlerts } from '@/src/application/getUnusedSubscriptionAlerts';
import type { MonthlySpendingTrend } from '@/src/domain/monthlySpendingTrend';
import type { GenreSpendingBreakdown } from '@/src/domain/spendingByGenre';
import type { UnusedSubscriptionAlert } from '@/src/domain/unusedSubscriptions';
import { fxRateRepositorySupabase } from '@/src/infrastructure/supabase/fxRateRepositorySupabase';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';
import { usageLogRepositorySupabase } from '@/src/infrastructure/supabase/usageLogRepositorySupabase';

interface AnalyticsState {
  genreBreakdown: GenreSpendingBreakdown | null;
  spendingTrend: MonthlySpendingTrend | null;
  unusedAlerts: UnusedSubscriptionAlert[];
  isLoading: boolean;
  errorMessage: string | null;
}

const INITIAL_STATE: AnalyticsState = {
  genreBreakdown: null,
  spendingTrend: null,
  unusedAlerts: [],
  isLoading: true,
  errorMessage: null,
};

export function useAnalytics() {
  const { session } = useAuth();
  const [state, setState] = useState<AnalyticsState>(INITIAL_STATE);
  const latestRequestIdRef = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;
    const userId = session?.user.id;
    if (!userId) {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setState({ ...INITIAL_STATE, isLoading: false });
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, errorMessage: null }));

    try {
      const [genreBreakdown, spendingTrend, unusedAlerts] = await Promise.all([
        getGenreSpendingBreakdown(subscriptionRepositorySupabase, fxRateRepositorySupabase),
        getMonthlySpendingTrend(subscriptionRepositorySupabase, fxRateRepositorySupabase),
        getUnusedSubscriptionAlerts(
          subscriptionRepositorySupabase,
          usageLogRepositorySupabase,
          userId
        ),
      ]);

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      setState({
        genreBreakdown,
        spendingTrend,
        unusedAlerts,
        isLoading: false,
        errorMessage: null,
      });
    } catch {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setState({
        genreBreakdown: null,
        spendingTrend: null,
        unusedAlerts: [],
        isLoading: false,
        errorMessage: '分析データの取得に失敗しました',
      });
    }
  }, [session?.user.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { ...state, reload };
}
