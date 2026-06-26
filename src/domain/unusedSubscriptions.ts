/**
 * 未使用サブスクの検知（F-11）。
 */

import { parseLocalDate } from './localDate';
import { toLocalDateOnly } from './nextBillingDate';
import type { Subscription } from './subscription';
import { isInTrial } from './trialPeriod';

export const DEFAULT_UNUSED_THRESHOLD_DAYS = 30;
export const YEARLY_UNUSED_THRESHOLD_DAYS = 90;

export interface UnusedSubscriptionAlert {
  subscription: Subscription;
  /** 最終利用日（YYYY-MM-DD）。記録がなければ null */
  lastUsedDate: string | null;
  daysSinceLastUse: number | null;
  thresholdDays: number;
}

export interface DetectUnusedSubscriptionsInput {
  subscriptions: Subscription[];
  /** subscriptionId -> 最終利用日 (YYYY-MM-DD) */
  lastUsedDateBySubscriptionId: ReadonlyMap<string, string>;
  /** ユーザーが一度でも利用チェックを使ったか */
  hasAnyUsageLogs: boolean;
  /**
   * true のとき、利用チェック未使用ユーザーにはアラートを出さない（F-11・通知向け）。
   * 分析画面では false にし、サブスクごとの未利用を判定する。
   */
  requireAnyUsageLogs?: boolean;
  today?: Date;
}

function getUnusedThresholdDays(subscription: Subscription): number {
  return subscription.plan.cycle === 'yearly'
    ? YEARLY_UNUSED_THRESHOLD_DAYS
    : DEFAULT_UNUSED_THRESHOLD_DAYS;
}

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

/** 未利用判定の基準日。契約開始日とアプリ登録日のうち、経過を測る起点として使う。 */
function getSubscriptionElapsedDays(subscription: Subscription, todayOnly: Date): {
  daysSinceStart: number;
  daysSinceCreated: number;
} {
  const startOnly = toLocalDateOnly(subscription.startDate);
  const createdOnly = toLocalDateOnly(subscription.createdAt);
  return {
    daysSinceStart: daysBetween(startOnly, todayOnly),
    daysSinceCreated: daysBetween(createdOnly, todayOnly),
  };
}

export function detectUnusedSubscriptions({
  subscriptions,
  lastUsedDateBySubscriptionId,
  hasAnyUsageLogs,
  requireAnyUsageLogs = false,
  today = new Date(),
}: DetectUnusedSubscriptionsInput): UnusedSubscriptionAlert[] {
  if (requireAnyUsageLogs && !hasAnyUsageLogs) {
    return [];
  }

  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const alerts: UnusedSubscriptionAlert[] = [];

  for (const subscription of subscriptions) {
    if (subscription.status !== 'active') {
      continue;
    }

    if (isInTrial(subscription, todayOnly)) {
      continue;
    }

    const thresholdDays = getUnusedThresholdDays(subscription);
    const { daysSinceStart, daysSinceCreated } = getSubscriptionElapsedDays(
      subscription,
      todayOnly
    );

    // 本当に新しい契約だけ猶予（アプリ登録・契約開始のどちらも threshold 未満）
    const isWithinGracePeriod =
      daysSinceCreated < thresholdDays && daysSinceStart < thresholdDays;
    if (isWithinGracePeriod) {
      continue;
    }

    const lastUsedDate = lastUsedDateBySubscriptionId.get(subscription.id) ?? null;
    const daysSinceLastUse =
      lastUsedDate != null
        ? daysBetween(parseLocalDate(lastUsedDate), todayOnly)
        : daysSinceStart;

    if (daysSinceLastUse >= thresholdDays) {
      alerts.push({
        subscription,
        lastUsedDate,
        daysSinceLastUse,
        thresholdDays,
      });
    }
  }

  return alerts.sort((a, b) => (b.daysSinceLastUse ?? 0) - (a.daysSinceLastUse ?? 0));
}

export function buildLastUsedDateMap(
  rows: readonly { subscriptionId: string; usedDate: string }[]
): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of rows) {
    const current = map.get(row.subscriptionId);
    if (current == null || row.usedDate > current) {
      map.set(row.subscriptionId, row.usedDate);
    }
  }
  return map;
}
