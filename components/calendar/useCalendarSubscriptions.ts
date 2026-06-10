import { useCallback, useEffect, useState } from 'react';

import { getMonthlySubscriptions } from '@/src/application/getMonthlySubscriptions';
import type { Subscription } from '@/src/domain/subscription';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function useCalendarSubscriptions() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [isExpanded, setIsExpanded] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  // 前後の月も読み込み、月またぎの週・隣月セルにも支払日アイコンを表示できるようにする
  const loadSubscriptions = useCallback(async (date: Date) => {
    const months = [-1, 0, 1].map((offset) => {
      const d = new Date(date.getFullYear(), date.getMonth() + offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
    const results = await Promise.all(
      months.map(({ year, month }) =>
        getMonthlySubscriptions(subscriptionRepositorySupabase, year, month)
      )
    );
    setSubscriptions(results.flat());
  }, []);

  useEffect(() => {
    void loadSubscriptions(currentDate);
  }, [currentDate, loadSubscriptions]);

  const goToPrev = useCallback(() => {
    if (isExpanded) {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
      return;
    }
    const next = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() - 7
    );
    setSelectedDate(next);
    setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
  }, [isExpanded, selectedDate]);

  const goToNext = useCallback(() => {
    if (isExpanded) {
      setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
      return;
    }
    const next = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate() + 7
    );
    setSelectedDate(next);
    setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
  }, [isExpanded, selectedDate]);

  const selectDate = useCallback(
    (date: Date) => {
      const day = startOfDay(date);
      setSelectedDate(day);
      if (
        day.getMonth() !== currentDate.getMonth() ||
        day.getFullYear() !== currentDate.getFullYear()
      ) {
        setCurrentDate(new Date(day.getFullYear(), day.getMonth(), 1));
      }
    },
    [currentDate]
  );

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return {
    currentDate,
    selectedDate,
    isExpanded,
    subscriptions,
    goToPrev,
    goToNext,
    selectDate,
    toggleExpanded,
  };
}
