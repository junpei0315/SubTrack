import { useCallback, useEffect, useMemo, useState } from 'react';

import { getUsedDates } from '@/src/application/getUsedDates';
import { recordUsage } from '@/src/application/recordUsage';
import { removeUsage } from '@/src/application/removeUsage';
import { formatLocalDate } from '@/src/domain/localDate';
import { usageLogRepositorySupabase } from '@/src/infrastructure/supabase/usageLogRepositorySupabase';
import type { UsageLogRepository } from '@/src/ports/usageLogRepository';

interface UseSubscriptionUsageParams {
  subscriptionId: string;
  userId: string;
  today?: Date;
  repository?: UsageLogRepository;
}

interface UseSubscriptionUsageResult {
  usedDateKeys: ReadonlySet<string>;
  isLoading: boolean;
  recordToday: () => Promise<void>;
  undoToday: () => Promise<void>;
}

/**
 * 利用ログの取得と「今日使った／取り消し」の楽観更新を担う presentation hook。
 * UI（UsageFrequencyTracker）はこの hook が返す集合とハンドラを使う。
 */
export function useSubscriptionUsage({
  subscriptionId,
  userId,
  today: todayProp,
  repository = usageLogRepositorySupabase,
}: UseSubscriptionUsageParams): UseSubscriptionUsageResult {
  const today = useMemo(() => todayProp ?? new Date(), [todayProp]);
  const todayKey = formatLocalDate(today);

  const [usedDateKeys, setUsedDateKeys] = useState<ReadonlySet<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    void getUsedDates(repository, subscriptionId)
      .then((dates) => {
        if (isMounted) {
          setUsedDateKeys(dates);
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.error('[useSubscriptionUsage] load failed', error);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [repository, subscriptionId]);

  const recordToday = useCallback(async () => {
    setUsedDateKeys((prev) => new Set(prev).add(todayKey));
    try {
      await recordUsage(repository, { userId, subscriptionId, usedDate: todayKey });
    } catch (error) {
      setUsedDateKeys((prev) => {
        const next = new Set(prev);
        next.delete(todayKey);
        return next;
      });
      if (__DEV__) {
        console.error('[useSubscriptionUsage] record failed', error);
      }
    }
  }, [repository, subscriptionId, userId, todayKey]);

  const undoToday = useCallback(async () => {
    setUsedDateKeys((prev) => {
      const next = new Set(prev);
      next.delete(todayKey);
      return next;
    });
    try {
      await removeUsage(repository, { subscriptionId, usedDate: todayKey });
    } catch (error) {
      setUsedDateKeys((prev) => new Set(prev).add(todayKey));
      if (__DEV__) {
        console.error('[useSubscriptionUsage] undo failed', error);
      }
    }
  }, [repository, subscriptionId, todayKey]);

  return { usedDateKeys, isLoading, recordToday, undoToday };
}
