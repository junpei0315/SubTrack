/**
 * ローカル通知のスケジュール組み立て（F-10 当日 / F-11 見直し）。
 */

import { formatLocalDate, parseLocalDate } from './localDate';
import type { Subscription } from './subscription';
import type { UnusedSubscriptionAlert } from './unusedSubscriptions';

export const BILLING_NOTIFICATION_HOUR = 9;
export const UNUSED_REVIEW_NOTIFICATION_HOUR = 10;

export type NotificationPayloadType = 'billing' | 'unused_review';

export interface ScheduledNotificationItem {
  identifier: string;
  triggerDate: Date;
  title: string;
  body: string;
  data: {
    type: NotificationPayloadType;
    subscriptionId?: string;
  };
}

function atLocalHour(date: Date, hour: number): Date {
  const next = new Date(date);
  next.setHours(hour, 0, 0, 0);
  return next;
}

function nextTriggerAtHour(hour: number, now: Date): Date {
  const trigger = atLocalHour(now, hour);
  if (trigger <= now) {
    trigger.setDate(trigger.getDate() + 1);
  }
  return trigger;
}

/**
 * 支払い日（next_billing_date）当日 9:00 に発火する通知を組み立てる。
 * 同日に複数ある場合は 1 件にまとめる。
 */
export function buildBillingDayNotifications(
  subscriptions: readonly Subscription[],
  now: Date = new Date()
): ScheduledNotificationItem[] {
  const byDate = new Map<string, Subscription[]>();

  for (const subscription of subscriptions) {
    if (subscription.status !== 'active') {
      continue;
    }
    const dateKey = formatLocalDate(subscription.nextBillingDate);
    const group = byDate.get(dateKey) ?? [];
    group.push(subscription);
    byDate.set(dateKey, group);
  }

  const items: ScheduledNotificationItem[] = [];

  for (const [dateKey, group] of byDate) {
    const triggerDate = atLocalHour(parseLocalDate(dateKey), BILLING_NOTIFICATION_HOUR);
    if (triggerDate <= now) {
      continue;
    }

    const sorted = [...group].sort((a, b) => a.service.name.localeCompare(b.service.name, 'ja'));
    const primary = sorted[0];

    items.push({
      identifier: `billing-${dateKey}`,
      triggerDate,
      title: '支払い日のお知らせ',
      body:
        sorted.length === 1
          ? `本日は ${primary.service.name} の支払い日です`
          : `本日は ${primary.service.name} など ${sorted.length} 件の支払い日です`,
      data: {
        type: 'billing',
        subscriptionId: primary.id,
      },
    });
  }

  return items;
}

/**
 * 未使用サブスクが 1 件以上あるとき、翌朝 10:00 に見直しを促す通知を 1 件組み立てる。
 */
export function buildUnusedReviewNotification(
  alerts: readonly UnusedSubscriptionAlert[],
  now: Date = new Date()
): ScheduledNotificationItem | null {
  if (alerts.length === 0) {
    return null;
  }

  const sorted = [...alerts].sort(
    (a, b) => (b.daysSinceLastUse ?? 0) - (a.daysSinceLastUse ?? 0)
  );
  const primary = sorted[0].subscription;
  const triggerDate = nextTriggerAtHour(UNUSED_REVIEW_NOTIFICATION_HOUR, now);

  return {
    identifier: 'unused-review',
    triggerDate,
    title: 'サブスク見直しのお知らせ',
    body:
      sorted.length === 1
        ? `${primary.service.name} が長期間未使用です。見直しをおすすめします`
        : `使っていないサブスクが ${sorted.length} 件あります（${primary.service.name} など）。見直しをおすすめします`,
    data: { type: 'unused_review' },
  };
}

export function buildNotificationSchedule(input: {
  subscriptions: readonly Subscription[];
  unusedAlerts: readonly UnusedSubscriptionAlert[];
  now?: Date;
}): ScheduledNotificationItem[] {
  const now = input.now ?? new Date();
  const items = [...buildBillingDayNotifications(input.subscriptions, now)];
  const unused = buildUnusedReviewNotification(input.unusedAlerts, now);

  if (unused) {
    items.push(unused);
  }

  return items;
}
