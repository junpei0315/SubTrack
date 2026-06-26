import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from '@/components/auth/AuthProvider';
import { useReloadOnSubscriptionChange } from '@/components/subscriptions/useReloadOnSubscriptionChange';
import { getExchangeRates } from '@/src/application/getExchangeRates';
import { getSubscriptions } from '@/src/application/getSubscriptions';
import { getUnusedSubscriptionAlerts } from '@/src/application/getUnusedSubscriptionAlerts';
import type { MonthlySpendingTrend } from '@/src/domain/monthlySpendingTrend';
import { computeMonthlySpendingTrend } from '@/src/domain/monthlySpendingTrend';
import type { GenreSpendingBreakdown } from '@/src/domain/spendingByGenre';
import { computeGenreSpendingBreakdown } from '@/src/domain/spendingByGenre';
import type { Subscription } from '@/src/domain/subscription';
import type { UnusedSubscriptionAlert } from '@/src/domain/unusedSubscriptions';
import { fxRateRepositorySupabase } from '@/src/infrastructure/supabase/fxRateRepositorySupabase';
import { subscriptionPriceHistoryRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionPriceHistoryRepositorySupabase';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';
import { usageLogRepositorySupabase } from '@/src/infrastructure/supabase/usageLogRepositorySupabase';

interface AnalyticsState {
  subscriptions: Subscription[];
  genreBreakdown: GenreSpendingBreakdown | null;
  spendingTrend: MonthlySpendingTrend | null;
  unusedAlerts: UnusedSubscriptionAlert[];
  hasUsageLogs: boolean;
  isLoading: boolean;
  errorMessage: string | null;
}

const INITIAL_STATE: AnalyticsState = {
  subscriptions: [],
  genreBreakdown: null,
  spendingTrend: null,
  unusedAlerts: [],
  hasUsageLogs: false,
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
      const [subscriptions, { rates }, unusedResult, priceHistory] = await Promise.all([
        getSubscriptions(subscriptionRepositorySupabase),
        getExchangeRates(fxRateRepositorySupabase),
        getUnusedSubscriptionAlerts(
          subscriptionRepositorySupabase,
          usageLogRepositorySupabase,
          userId
        ),
        subscriptionPriceHistoryRepositorySupabase.listByUserId(userId),
      ]);

      if (requestId !== latestRequestIdRef.current) {
        return;
      }

      setState({
        subscriptions,
        genreBreakdown: computeGenreSpendingBreakdown(subscriptions, rates),
        spendingTrend: computeMonthlySpendingTrend(subscriptions, rates, {}, priceHistory),
        unusedAlerts: unusedResult.alerts,
        hasUsageLogs: unusedResult.hasUsageLogs,
        isLoading: false,
        errorMessage: null,
      });
    } catch {
      if (requestId !== latestRequestIdRef.current) {
        return;
      }
      setState({
        subscriptions: [],
        genreBreakdown: null,
        spendingTrend: null,
        unusedAlerts: [],
        hasUsageLogs: false,
        isLoading: false,
        errorMessage: '分析データの取得に失敗しました',
      });
    }
  }, [session?.user.id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useReloadOnSubscriptionChange(reload);

  return { ...state, reload };
}
