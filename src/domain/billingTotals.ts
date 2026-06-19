/**
 * 請求額の合計計算に関する純粋関数。
 * ドメイン層なので React / Supabase 等には依存しない。
 *
 * 関連機能: F-05（合計金額表示）
 */

import { getMonthlyNormalizedPrice, getYearlyNormalizedPrice } from './normalizeBilling';
import type { Subscription } from './subscription';

export interface BillingTotal {
  /** 合計金額 */
  amount: number;
  /** 合計に使った通貨コード（混在時は最初に出現した通貨を採用） */
  currency: string;
  /** 合計に含めたサブスク件数 */
  count: number;
}

/** @deprecated F-05 統一のため BillingTotal を使用 */
export type MonthlyBillingTotal = BillingTotal;

function sumActiveNormalized(
  subscriptions: Subscription[],
  normalize: (sub: Subscription) => number
): BillingTotal {
  const targets = subscriptions.filter((sub) => sub.status === 'active');
  const amount = targets.reduce((sum, sub) => sum + normalize(sub), 0);
  const currency = targets[0]?.plan.currency ?? 'JPY';

  return {
    amount,
    currency,
    count: targets.length,
  };
}

/**
 * 契約中サブスクの月額換算合計（F-05 月額表示）。
 * 月額 + 年額÷12 + 週額×4.3
 */
export function computeActiveMonthlyTotal(subscriptions: Subscription[]): BillingTotal {
  return sumActiveNormalized(subscriptions, getMonthlyNormalizedPrice);
}

/**
 * 契約中サブスクの年額換算合計（F-05 年額表示）。
 * 年額 + 月額×12 + 週額×52
 */
export function computeActiveYearlyTotal(subscriptions: Subscription[]): BillingTotal {
  return sumActiveNormalized(subscriptions, getYearlyNormalizedPrice);
}

/**
 * @deprecated computeActiveMonthlyTotal を使用する
 */
export function computeMonthlyBillingTotal(
  subscriptions: Subscription[],
  _year: number,
  _month: number
): BillingTotal {
  return computeActiveMonthlyTotal(subscriptions);
}
