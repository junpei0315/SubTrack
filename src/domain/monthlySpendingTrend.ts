/**
 * 契約ごとの月次想定支出トレンド（F-07）。
 */

import {
  computeBillingTotalForMonth,
  monthBounds,
} from './billingOccurrences';
import { convertToJpy, DISPLAY_CURRENCY, type ExchangeRates } from './exchangeRate';
import { toLocalDateOnly } from './nextBillingDate';
import type { Subscription } from './subscription';
import type { SubscriptionPriceEntry } from './subscriptionPriceHistory';

export { computeBillingTotalForMonth } from './billingOccurrences';

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
  rates: ExchangeRates,
  options: MonthlySpendingTrendOptions = {},
  priceHistory: readonly SubscriptionPriceEntry[] = []
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

  const currency = DISPLAY_CURRENCY;
  const todayOnly = toLocalDateOnly(today);

  const points: MonthlySpendingPoint[] = months.map((yearMonth) => {
    const { end: monthEnd } = monthBounds(yearMonth.year, yearMonth.month);
    // 今月・未来は契約中のみ（F-07: 解約済みは支払い予定に含めない）。過去月は解約前の請求を再構成。
    const isPastMonth = monthEnd < todayOnly;
    const targets = subscriptions.filter((sub) => {
      if (sub.status === 'active') {
        return true;
      }
      if (sub.status === 'cancelled') {
        return isPastMonth;
      }
      return false;
    });

    const amount = targets.reduce((sum, sub) => {
      const monthTotal = computeBillingTotalForMonth(
        sub,
        yearMonth.year,
        yearMonth.month,
        priceHistory
      );
      return sum + convertToJpy(monthTotal, sub.plan.currency, rates);
    }, 0);
    const monthStart = monthBounds(yearMonth.year, yearMonth.month).start;
    const isProjected = monthStart > todayOnly;

    return {
      yearMonth,
      label: formatYearMonthLabel(yearMonth, today),
      amount,
      isProjected,
    };
  });

  return { currency, points };
}
