/**
 * 未使用サブスクの検知（F-11）。
 */

import { parseLocalDate } from './localDate';
import type { Subscription } from './subscription';

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

export function detectUnusedSubscriptions({
  subscriptions,
  lastUsedDateBySubscriptionId,
  hasAnyUsageLogs,
  today = new Date(),
}: DetectUnusedSubscriptionsInput): UnusedSubscriptionAlert[] {
  if (!hasAnyUsageLogs) {
    return [];
  }

  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const alerts: UnusedSubscriptionAlert[] = [];

  for (const subscription of subscriptions) {
    if (subscription.status !== 'active') {
      continue;
    }

    const thresholdDays = getUnusedThresholdDays(subscription);
    const registeredDays = daysBetween(
      new Date(
        subscription.createdAt.getFullYear(),
        subscription.createdAt.getMonth(),
        subscription.createdAt.getDate()
      ),
      todayOnly
    );

    if (registeredDays < thresholdDays) {
      continue;
    }

    const lastUsedDate = lastUsedDateBySubscriptionId.get(subscription.id) ?? null;
    const daysSinceLastUse =
      lastUsedDate != null
        ? daysBetween(parseLocalDate(lastUsedDate), todayOnly)
        : registeredDays;

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
