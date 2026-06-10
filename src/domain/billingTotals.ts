/**
 * 請求額の合計計算に関する純粋関数。
 * ドメイン層なので React / Supabase 等には依存しない。
 *
 * 「次回請求日（nextBillingDate）が対象月にあるサブスクの料金を合計する」ことを
 * ここに閉じ込め、サブスクの取得元（DB / モック）や個々の金額の変動に依存させない。
 *
 * 関連機能: F-05（合計金額表示）
 */

import type { Subscription } from './subscription';

export interface MonthlyBillingTotal {
  /** 合計金額（対象月に請求されるサブスクの料金合計） */
  amount: number;
  /** 合計に使った通貨コード（混在時は最初に出現した通貨を採用） */
  currency: string;
  /** 合計に含めたサブスク件数 */
  count: number;
}

/**
 * 次回請求日が指定の年月にあるかどうかを判定する（端末ローカルタイム基準）。
 */
function isBilledInMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() + 1 === month;
}

/**
 * 指定した年月（month は 1〜12）に請求されるサブスクの料金合計を計算する。
 *
 * - `status === 'active'` のサブスクのみを対象にする（paused / cancelled は除外）。
 * - 次回請求日（nextBillingDate）がその月にあるものだけを合計する。
 * - 通貨換算は行わない（F-13 の範囲）。混在時は最初の通貨を採用する。
 */
export function computeMonthlyBillingTotal(
  subscriptions: Subscription[],
  year: number,
  month: number
): MonthlyBillingTotal {
  const targets = subscriptions.filter(
    (sub) => sub.status === 'active' && isBilledInMonth(sub.nextBillingDate, year, month)
  );

  const amount = targets.reduce((sum, sub) => sum + sub.plan.price, 0);
  const currency = targets[0]?.plan.currency ?? 'JPY';

  return {
    amount,
    currency,
    count: targets.length,
  };
}
