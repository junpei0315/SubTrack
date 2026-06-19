/**
 * 契約ごとの月次想定支出トレンド（F-07）。
 */

import {
  computeBillingTotalForMonth,
  monthBounds,
} from './billingOccurrences';
import { toLocalDateOnly } from './nextBillingDate';
import type { Subscription } from './subscription';

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
    const monthStart = monthBounds(yearMonth.year, yearMonth.month).start;
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
