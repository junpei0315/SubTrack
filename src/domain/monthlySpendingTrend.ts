/**
 * 契約ごとの請求発生日・月次請求額（F-07）。
 */

import { addBillingCycle, toLocalDateOnly } from './nextBillingDate';
import type { Subscription } from './subscription';
import { getEffectiveSubscriptionPrice } from './subscriptionPrice';

const MAX_BILLING_ITERATIONS = 600;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function estimateStartCycleIndex(subscription: Subscription, monthStart: Date): number {
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

function monthBounds(year: number, month: number): { start: Date; end: Date } {
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0),
  };
}

function isRelevantForMonth(subscription: Subscription, year: number, month: number): boolean {
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
 * 指定月に発生する請求回数分の合計額を返す（週額は月内の複数回を合算）。
 */
export function computeBillingTotalForMonth(
  subscription: Subscription,
  year: number,
  month: number
): number {
  if (!isRelevantForMonth(subscription, year, month)) {
    return 0;
  }

  const { start: monthStart, end: monthEnd } = monthBounds(year, month);
  const charge = getEffectiveSubscriptionPrice(subscription);
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

export interface YearMonth {
  year: number;
  /** 1-12 */
  month: number;
}

export function shiftYearMonth({ year, month }: YearMonth, deltaMonths: number): YearMonth {
  const date = new Date(year, month - 1 + deltaMonths, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

export function formatYearMonthLabel({ year, month }: YearMonth, today: Date): string {
  const isCurrent =
    year === today.getFullYear() && month === today.getMonth() + 1;
  return isCurrent ? '今月' : `${month}月`;
}

export interface MonthlySpendingPoint {
  yearMonth: YearMonth;
  label: string;
  amount: number;
  /** 今日より未来の月 */
  isProjected: boolean;
}

export interface MonthlySpendingTrend {
  currency: string;
  points: MonthlySpendingPoint[];
}

export interface MonthlySpendingTrendOptions {
  pastMonths?: number;
  futureMonths?: number;
  today?: Date;
}

/**
 * 過去・現在・未来の月ごと想定支出を算出する（支払い履歴ではなく契約からの再構成）。
 */
export function computeMonthlySpendingTrend(
  subscriptions: Subscription[],
  options: MonthlySpendingTrendOptions = {}
): MonthlySpendingTrend {
  const today = options.today ?? new Date();
  const pastMonths = options.pastMonths ?? 3;
  const futureMonths = options.futureMonths ?? 2;

  const anchor: YearMonth = {
    year: today.getFullYear(),
    month: today.getMonth() + 1,
  };

  const months: YearMonth[] = [];
  for (let offset = -pastMonths; offset <= futureMonths; offset++) {
    months.push(shiftYearMonth(anchor, offset));
  }

  const activeOrCancelled = subscriptions.filter(
    (sub) => sub.status === 'active' || sub.status === 'cancelled'
  );
  const currency = activeOrCancelled[0]?.plan.currency ?? 'JPY';

  const points: MonthlySpendingPoint[] = months.map((yearMonth) => {
    const amount = activeOrCancelled.reduce(
      (sum, sub) => sum + computeBillingTotalForMonth(sub, yearMonth.year, yearMonth.month),
      0
    );
    const monthStart = new Date(yearMonth.year, yearMonth.month - 1, 1);
    const isProjected = monthStart > toLocalDateOnly(today);

    return {
      yearMonth,
      label: formatYearMonthLabel(yearMonth, today),
      amount,
      isProjected,
    };
  });

  return { currency, points };
}
