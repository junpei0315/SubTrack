/**
 * 見直しで浮きそうな金額と生活への換算（分析画面）。
 */

import { convertToJpy, type ExchangeRates } from './exchangeRate';
import { getMonthlyNormalizedPrice } from './normalizeBilling';
import type { UnusedSubscriptionAlert } from './unusedSubscriptions';

const MONTHS_PER_YEAR = 12;
const LUNCH_UNIT_YEN = 500;
const COFFEE_UNIT_YEN = 400;
const BOOK_UNIT_YEN = 1500;

export type SpendingEquivalentKind = 'coffee' | 'lunch' | 'book' | 'savings';

export interface SavingsInsightItem {
  subscriptionId: string;
  serviceName: string;
  monthlyAmountJpy: number;
  daysSinceLastUse: number | null;
  logoKey: string | null;
  logoUri: string | null;
}

export interface SpendingEquivalent {
  kind: SpendingEquivalentKind;
  description: string;
}

export interface SavingsInsight {
  monthlyAmountJpy: number;
  yearlyAmountJpy: number;
  items: SavingsInsightItem[];
  equivalents: SpendingEquivalent[];
}

function toMonthlyAmountJpy(
  alert: UnusedSubscriptionAlert,
  rates: ExchangeRates
): number | null {
  const monthly = getMonthlyNormalizedPrice(alert.subscription);
  try {
    return Math.round(convertToJpy(monthly, alert.subscription.plan.currency, rates));
  } catch {
    return null;
  }
}

export function buildSpendingEquivalents(
  monthlyAmountJpy: number,
  yearlyAmountJpy: number
): SpendingEquivalent[] {
  if (monthlyAmountJpy <= 0) {
    return [];
  }

  const equivalents: SpendingEquivalent[] = [];

  if (monthlyAmountJpy < LUNCH_UNIT_YEN) {
    const count = Math.max(1, Math.round(monthlyAmountJpy / COFFEE_UNIT_YEN));
    equivalents.push({ kind: 'coffee', description: `コーヒー約 ${count} 杯分 / 月` });
  } else {
    const lunchCount = Math.max(1, Math.round(monthlyAmountJpy / LUNCH_UNIT_YEN));
    equivalents.push({ kind: 'lunch', description: `ランチ約 ${lunchCount} 回分 / 月` });
  }

  if (yearlyAmountJpy >= BOOK_UNIT_YEN * 2) {
    const bookCount = Math.max(1, Math.round(yearlyAmountJpy / BOOK_UNIT_YEN));
    equivalents.push({ kind: 'book', description: `本約 ${bookCount} 冊分 / 年` });
  } else if (yearlyAmountJpy >= 3000) {
    const thousands = Math.round(yearlyAmountJpy / 1000);
    equivalents.push({
      kind: 'savings',
      description: `年間で約 ${thousands.toLocaleString('ja-JP')} 千円の貯蓄に`,
    });
  }

  return equivalents.slice(0, 2);
}

export function computeSavingsInsight(
  alerts: UnusedSubscriptionAlert[],
  rates: ExchangeRates
): SavingsInsight {
  const items: SavingsInsightItem[] = [];

  for (const alert of alerts) {
    const monthlyAmountJpy = toMonthlyAmountJpy(alert, rates);
    if (monthlyAmountJpy == null) {
      continue;
    }

    items.push({
      subscriptionId: alert.subscription.id,
      serviceName: alert.subscription.service.name,
      monthlyAmountJpy,
      daysSinceLastUse: alert.daysSinceLastUse,
      logoKey: alert.subscription.service.logoKey ?? null,
      logoUri: alert.subscription.service.logoUri ?? null,
    });
  }

  items.sort((a, b) => b.monthlyAmountJpy - a.monthlyAmountJpy);

  const monthlyAmountJpy = items.reduce((sum, item) => sum + item.monthlyAmountJpy, 0);
  const yearlyAmountJpy = monthlyAmountJpy * MONTHS_PER_YEAR;

  return {
    monthlyAmountJpy,
    yearlyAmountJpy,
    items,
    equivalents: buildSpendingEquivalents(monthlyAmountJpy, yearlyAmountJpy),
  };
}
