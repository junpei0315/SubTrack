import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';

import { useReloadOnSubscriptionChange } from '@/components/subscriptions/useReloadOnSubscriptionChange';
import type { Subscription } from '@/src/domain/subscription';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function useCalendarSubscriptions() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
  const [isExpanded, setIsExpanded] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  // 矢印連打などで複数 fetch が走ったとき、最新リクエストの結果だけを反映するためのガード。
  const requestIdRef = useRef(0);

  const loadSubscriptions = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const results = await subscriptionRepositorySupabase.findAll();
    if (requestId === requestIdRef.current) {
      setSubscriptions(results.filter((sub) => sub.status === 'active'));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSubscriptions();
      return () => {
        requestIdRef.current += 1;
      };
    }, [loadSubscriptions])
  );

  useReloadOnSubscriptionChange(loadSubscriptions);

  // 月表示で月を移動するとき、selectedDate も移動先の月へ寄せる。
  // 週表示は selectedDate 基準で描画するため、同期しないとヘッダー月と表示週がずれる。
  const goToMonth = useCallback(
    (offset: number) => {
      const target = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
      const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      const day = Math.min(selectedDate.getDate(), lastDay);
      setCurrentDate(target);
      setSelectedDate(new Date(target.getFullYear(), target.getMonth(), day));
    },
    [currentDate, selectedDate]
  );

  const goToWeek = useCallback(
    (offset: number) => {
      const next = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate() + offset * 7
      );
      setSelectedDate(next);
      setCurrentDate(new Date(next.getFullYear(), next.getMonth(), 1));
    },
    [selectedDate]
  );

  const goToPrev = useCallback(() => {
    if (isExpanded) {
      goToMonth(-1);
      return;
    }
    goToWeek(-1);
  }, [isExpanded, goToMonth, goToWeek]);

  const goToNext = useCallback(() => {
    if (isExpanded) {
      goToMonth(1);
      return;
    }
    goToWeek(1);
  }, [isExpanded, goToMonth, goToWeek]);

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const selectDate = useCallback((date: Date) => {
    const normalized = startOfDay(date);
    setSelectedDate(normalized);
    setCurrentDate(new Date(normalized.getFullYear(), normalized.getMonth(), 1));
  }, []);

  return {
    currentDate,
    selectedDate,
    isExpanded,
    subscriptions,
    goToPrev,
    goToNext,
    toggleExpanded,
    selectDate,
  };
}
