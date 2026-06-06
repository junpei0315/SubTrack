import { useCallback, useEffect, useState } from 'react';

import { getMonthlySubscriptions } from '@/src/application/getMonthlySubscriptions';
import type { Subscription } from '@/src/domain/subscription';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

export function useCalendarSubscriptions() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const loadSubscriptions = useCallback(async (date: Date) => {
    const subs = await getMonthlySubscriptions(
      subscriptionRepositorySupabase,
      date.getFullYear(),
      date.getMonth() + 1
    );
    setSubscriptions(subs);
  }, []);

  useEffect(() => {
    void loadSubscriptions(currentDate);
  }, [currentDate, loadSubscriptions]);

  const goToPrevMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  return {
    currentDate,
    subscriptions,
    goToPrevMonth,
    goToNextMonth,
  };
}
