/**
 * 契約料金の履歴（effective_from 以降に適用）。
 * F-03: 「今月から変更」時に過去月の集計を維持する。
 */

import { toLocalDateOnly } from './nextBillingDate';
import type { Subscription } from './subscription';
import { getEffectiveSubscriptionPrice } from './subscriptionPrice';

export interface SubscriptionPriceEntry {
  subscriptionId: string;
  effectiveFrom: Date;
  price: number;
}

export type PriceChangeScope = 'all_time' | 'from_current_month';

export function normalizeSubscriptionPrice(value: number): number {
  return Math.round(value * 10000) / 10000;
}

export function firstDayOfMonth(date: Date): Date {
  const local = toLocalDateOnly(date);
  return new Date(local.getFullYear(), local.getMonth(), 1);
}

/**
 * 指定日時点で有効な契約料金を返す。
 * 履歴がなければ custom_price / plan.price にフォールバックする。
 */
export function resolveSubscriptionPrice(
  subscription: Subscription,
  history: readonly SubscriptionPriceEntry[],
  asOfDate: Date
): number {
  const asOf = toLocalDateOnly(asOfDate).getTime();
  const applicable = history
    .filter((entry) => entry.subscriptionId === subscription.id)
    .filter((entry) => toLocalDateOnly(entry.effectiveFrom).getTime() <= asOf)
    .sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime());

  if (applicable.length > 0) {
    return applicable[0].price;
  }

  return getEffectiveSubscriptionPrice(subscription);
}

/** 指定月の集計に使う料金（月末時点で有効な価格）。 */
export function resolveSubscriptionPriceForMonth(
  subscription: Subscription,
  history: readonly SubscriptionPriceEntry[],
  year: number,
  month: number
): number {
  const monthEnd = new Date(year, month, 0);
  return resolveSubscriptionPrice(subscription, history, monthEnd);
}

export function groupPriceHistoryBySubscription(
  entries: readonly SubscriptionPriceEntry[]
): Map<string, SubscriptionPriceEntry[]> {
  const map = new Map<string, SubscriptionPriceEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.subscriptionId) ?? [];
    list.push(entry);
    map.set(entry.subscriptionId, list);
  }
  return map;
}
