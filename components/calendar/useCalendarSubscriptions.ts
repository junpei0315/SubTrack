import { useCallback, useEffect, useRef, useState } from 'react';

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
  // 矢印連打などで複数 fetch が走ったとき、最新リクエストの結果だけを反映するためのガード。
  const requestIdRef = useRef(0);

  // 前後の月も読み込み、月またぎの週・隣月セルにも支払日アイコンを表示できるようにする
  const loadSubscriptions = useCallback(async (date: Date) => {
    const requestId = ++requestIdRef.current;
    const months = [-1, 0, 1].map((offset) => {
      const d = new Date(date.getFullYear(), date.getMonth() + offset, 1);
      return { year: d.getFullYear(), month: d.getMonth() + 1 };
    });
    const results = await Promise.all(
      months.map(({ year, month }) =>
        getMonthlySubscriptions(subscriptionRepositorySupabase, year, month)
      )
    );
    // 後着の古いリクエストで最新表示を上書きしない。
    if (requestId === requestIdRef.current) {
      setSubscriptions(results.flat());
    }
  }, []);

  useEffect(() => {
    void loadSubscriptions(currentDate);
  }, [currentDate, loadSubscriptions]);

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
