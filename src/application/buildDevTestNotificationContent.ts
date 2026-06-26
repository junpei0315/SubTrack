import { getUnusedSubscriptionAlerts } from '@/src/application/getUnusedSubscriptionAlerts';
import {
  buildBillingDayNotifications,
  buildTrialEndingNotifications,
  buildUnusedReviewNotification,
  type NotificationPayloadType,
  type ScheduledNotificationItem,
} from '@/src/domain/notificationSchedule';
import { supabase } from '@/src/infrastructure/supabase/client';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';
import { usageLogRepositorySupabase } from '@/src/infrastructure/supabase/usageLogRepositorySupabase';

export type DevTestNotificationKind = Extract<
  NotificationPayloadType,
  'billing' | 'trial_ending' | 'unused_review'
>;

function devTestReferenceDate(): Date {
  const reference = new Date();
  reference.setHours(8, 0, 0, 0);
  return reference;
}

/**
 * 隠しコマンド用テスト通知の本文。本番スケジュールと同じ組み立てロジックを使う。
 */
export async function buildDevTestNotificationContent(
  kind: DevTestNotificationKind
): Promise<ScheduledNotificationItem | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user.id;
  if (!userId) {
    return null;
  }

  const [subscriptions, { alerts: unusedAlerts }] = await Promise.all([
    subscriptionRepositorySupabase.findAll(),
    getUnusedSubscriptionAlerts(
      subscriptionRepositorySupabase,
      usageLogRepositorySupabase,
      userId,
      { requireAnyUsageLogs: true }
    ),
  ]);

  const now = devTestReferenceDate();

  switch (kind) {
    case 'billing':
      return buildBillingDayNotifications(subscriptions, now)[0] ?? null;
    case 'trial_ending':
      return buildTrialEndingNotifications(subscriptions, now)[0] ?? null;
    case 'unused_review':
      return buildUnusedReviewNotification(unusedAlerts, now);
  }
}
