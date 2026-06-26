/**
 * 支出推移タブ用のインサイト（F-07）。
 */

import { formatPrice } from './money';
import type { MonthlySpendingPoint, MonthlySpendingTrend } from './monthlySpendingTrend';
import type { Subscription } from './subscription';

export interface TrendInsights {
  currentMonthAmount: number;
  previousMonthAmount: number | null;
  momDelta: number | null;
  momPercent: number | null;
  annualPace: number;
  peakPoint: MonthlySpendingPoint | null;
}

export interface SpendingChangeHint {
  label: string;
}

function isSameMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

function findCurrentPoint(
  trend: MonthlySpendingTrend,
  today: Date
): MonthlySpendingPoint | undefined {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  return trend.points.find(
    (point) =>
      !point.isProjected &&
      point.yearMonth.year === year &&
      point.yearMonth.month === month
  );
}

function findPreviousPoint(
  trend: MonthlySpendingTrend,
  today: Date
): MonthlySpendingPoint | undefined {
  const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  return trend.points.find(
    (point) =>
      !point.isProjected &&
      point.yearMonth.year === prev.getFullYear() &&
      point.yearMonth.month === prev.getMonth() + 1
  );
}

export function computeTrendInsights(
  trend: MonthlySpendingTrend,
  today: Date = new Date()
): TrendInsights {
  const current = findCurrentPoint(trend, today);
  const previous = findPreviousPoint(trend, today);
  const currentMonthAmount = current?.amount ?? 0;
  const previousMonthAmount = previous?.amount ?? null;

  let momDelta: number | null = null;
  let momPercent: number | null = null;

  if (previousMonthAmount != null) {
    momDelta = currentMonthAmount - previousMonthAmount;
    if (previousMonthAmount > 0) {
      momPercent = Math.round((momDelta / previousMonthAmount) * 100);
    }
  }

  const annualPace = currentMonthAmount * 12;

  const currentYear = today.getFullYear();
  const yearPoints = trend.points.filter((point) => point.yearMonth.year === currentYear);
  const peakPoint =
    yearPoints.length > 0
      ? yearPoints.reduce((max, point) => (point.amount > max.amount ? point : max))
      : null;

  return {
    currentMonthAmount,
    previousMonthAmount,
    momDelta,
    momPercent,
    annualPace,
    peakPoint,
  };
}

export function formatMomComparison(
  insights: TrendInsights,
  currency: string
): string | null {
  if (insights.momDelta == null) {
    return null;
  }

  if (insights.momDelta === 0) {
    return '前月比 変化なし';
  }

  const sign = insights.momDelta > 0 ? '+' : '-';
  const amountText = `${sign}${formatPrice(Math.abs(insights.momDelta), currency)}`;

  if (
    insights.momPercent != null &&
    insights.previousMonthAmount != null &&
    insights.previousMonthAmount > 0
  ) {
    const percentSign = insights.momPercent >= 0 ? '+' : '';
    return `前月比 ${amountText}（${percentSign}${insights.momPercent}%）`;
  }

  return `前月比 ${amountText}`;
}

export function formatPeakMonthHint(
  peakPoint: MonthlySpendingPoint | null,
  currency: string,
  today: Date = new Date()
): string | null {
  if (!peakPoint || peakPoint.amount <= 0) {
    return null;
  }

  const isCurrentMonth =
    peakPoint.yearMonth.year === today.getFullYear() &&
    peakPoint.yearMonth.month === today.getMonth() + 1;

  const monthLabel = peakPoint.label;
  const amount = formatPrice(peakPoint.amount, currency);

  if (isCurrentMonth) {
    return `今年いちばん高いのは今月（${amount} 想定）`;
  }

  return `今年いちばん高いのは${monthLabel}（${amount} 想定）`;
}

export function buildSpendingChangeHints(
  subscriptions: readonly Subscription[],
  insights: TrendInsights,
  today: Date = new Date()
): SpendingChangeHint[] {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const hints: SpendingChangeHint[] = [];

  const newCount = subscriptions.filter(
    (sub) => sub.status === 'active' && isSameMonth(sub.startDate, year, month)
  ).length;

  const cancelledCount = subscriptions.filter(
    (sub) => sub.cancelledAt != null && isSameMonth(sub.cancelledAt, year, month)
  ).length;

  if (newCount > 0) {
    hints.push({ label: `今月の新規登録 ${newCount}件` });
  }

  if (cancelledCount > 0) {
    hints.push({ label: `今月の解約 ${cancelledCount}件` });
  }

  const shouldExplainDelta =
    insights.momDelta != null &&
    Math.abs(insights.momDelta) >= 500 &&
    (insights.momPercent == null || Math.abs(insights.momPercent) >= 5);

  if (shouldExplainDelta && hints.length === 0) {
    if (insights.momDelta! > 0) {
      hints.push({ label: '前月より契約内容の増加が影響している可能性があります' });
    } else {
      hints.push({ label: '前月より契約内容の減少が影響している可能性があります' });
    }
  }

  return hints;
}
