/**
 * 契約開始日とサイクルから請求発生日を列挙する純粋関数。
 * next_billing_date（次回1件）ではなく、繰り返し請求の各日を判定する。
 *
 * 関連機能: F-07（支出推移）, Home カレンダー
 */

import { formatLocalDate } from './localDate';
import { addBillingCycle, toLocalDateOnly } from './nextBillingDate';
import type { Subscription } from './subscription';
import { getEffectiveSubscriptionPrice } from './subscriptionPrice';
import type { SubscriptionPriceEntry } from './subscriptionPriceHistory';
import { resolveSubscriptionPriceForMonth } from './subscriptionPriceHistory';

const MAX_BILLING_ITERATIONS = 600;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function monthBounds(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0),
  };
}

export function estimateStartCycleIndex(subscription: Subscription, monthStart: Date): number {
  const start = toLocalDateOnly(subscription.startDate);
  if (start >= monthStart) {
    return 0;
  }

  switch (subscription.plan.cycle) {
    case 'weekly':
      return Math.max(
        0,
        Math.floor((monthStart.getTime() - start.getTime()) / (7 * MS_PER_DAY)) - 1
      );
    case 'monthly':
      return Math.max(
        0,
        (monthStart.getFullYear() - start.getFullYear()) * 12 +
          (monthStart.getMonth() - start.getMonth()) -
          1
      );
    case 'yearly':
      return Math.max(0, monthStart.getFullYear() - start.getFullYear() - 1);
  }
}

export function isRelevantForMonth(
  subscription: Subscription,
  year: number,
  month: number
): boolean {
  if (subscription.status === 'paused') {
    return false;
  }

  const { start, end } = monthBounds(year, month);

  if (subscription.startDate > end) {
    return false;
  }

  if (subscription.cancelledAt) {
    const cancelled = toLocalDateOnly(subscription.cancelledAt);
    if (cancelled < start) {
      return false;
    }
  }

  return true;
}

/**
 * 指定日に請求が発生するか（active / 解約前の cancelled を対象）。
 */
export function hasBillingOnDate(subscription: Subscription, date: Date): boolean {
  if (subscription.status !== 'active' && subscription.status !== 'cancelled') {
    return false;
  }

  const target = toLocalDateOnly(date);
  const year = target.getFullYear();
  const month = target.getMonth() + 1;

  if (!isRelevantForMonth(subscription, year, month)) {
    return false;
  }

  const targetKey = formatLocalDate(target);
  const { start: monthStart, end: monthEnd } = monthBounds(year, month);
  const cancelled =
    subscription.cancelledAt != null ? toLocalDateOnly(subscription.cancelledAt) : null;

  const startIndex = estimateStartCycleIndex(subscription, monthStart);
  for (let step = 0, n = startIndex; step < MAX_BILLING_ITERATIONS; step += 1, n += 1) {
    const billingDate = addBillingCycle(subscription.startDate, subscription.plan.cycle, n);
    if (billingDate > monthEnd) {
      break;
    }
    if (formatLocalDate(billingDate) === targetKey) {
      return cancelled == null || billingDate <= cancelled;
    }
  }

  return false;
}

/**
 * 指定月に発生する請求回数分の合計額を返す（週額は月内の複数回を合算）。
 */
export function computeBillingTotalForMonth(
  subscription: Subscription,
  year: number,
  month: number,
  priceHistory: readonly SubscriptionPriceEntry[] = []
): number {
  if (!isRelevantForMonth(subscription, year, month)) {
    return 0;
  }

  const { start: monthStart, end: monthEnd } = monthBounds(year, month);

  if (subscription.trialEndsOn != null) {
    const trialEnd = toLocalDateOnly(subscription.trialEndsOn);
    if (trialEnd > monthEnd) {
      return 0;
    }
  }

  const charge =
    priceHistory.length > 0
      ? resolveSubscriptionPriceForMonth(subscription, priceHistory, year, month)
      : getEffectiveSubscriptionPrice(subscription);
  const cancelled =
    subscription.cancelledAt != null ? toLocalDateOnly(subscription.cancelledAt) : null;

  let total = 0;

  const startIndex = estimateStartCycleIndex(subscription, monthStart);
  for (let step = 0, n = startIndex; step < MAX_BILLING_ITERATIONS; step += 1, n += 1) {
    const billingDate = addBillingCycle(subscription.startDate, subscription.plan.cycle, n);
    if (billingDate > monthEnd) {
      break;
    }
    if (billingDate >= monthStart && billingDate <= monthEnd) {
      if (cancelled == null || billingDate <= cancelled) {
        total += charge;
      }
    }
  }

  return total;
}
