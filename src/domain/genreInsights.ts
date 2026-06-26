/**
 * ジャンル別支出タブ用のインサイト文言（F-06）。
 */

import type { GenreSpendingBreakdown, GenreSpendingItem } from './spendingByGenre';

export type GenreAmountPeriod = 'month' | 'year';

export function scaleGenreAmount(amount: number, period: GenreAmountPeriod): number {
  return period === 'year' ? amount * 12 : amount;
}

export function genrePeriodLabel(period: GenreAmountPeriod): string {
  return period === 'year' ? '年額換算' : '月額換算';
}

export function buildGenreInsight(breakdown: GenreSpendingBreakdown): string | null {
  if (breakdown.items.length === 0) {
    return null;
  }

  const [top, second] = breakdown.items;
  const topPercent = Math.round(top.percentage * 100);

  if (topPercent >= 50) {
    return `${top.genre}が全体の${topPercent}%を占めています`;
  }

  if (breakdown.items.length === 1) {
    return `すべて${top.genre}に集中しています`;
  }

  if (breakdown.items.length === 2 && second) {
    return `${top.genre}と${second.genre}が中心です`;
  }

  return `契約は${breakdown.items.length}ジャンルに分散しています`;
}

export function formatGenreServiceSummary(item: GenreSpendingItem): string {
  const { subscriptions } = item;
  if (subscriptions.length === 0) {
    return '';
  }
  if (subscriptions.length === 1) {
    return subscriptions[0].serviceName;
  }
  if (subscriptions.length === 2) {
    return `${subscriptions[0].serviceName}、${subscriptions[1].serviceName}`;
  }
  return `${subscriptions[0].serviceName} ほか ${subscriptions.length - 1}件`;
}

export function averageAmountPerSubscription(item: GenreSpendingItem): number {
  if (item.subscriptions.length === 0) {
    return 0;
  }
  return Math.round(item.amount / item.subscriptions.length);
}
