/**
 * 次回請求日の算出に関する純粋関数。
 * DB の calc_next_billing_date と同じロジックをクライアント登録時にも使う。
 *
 * 関連機能: F-01（プリセット登録）, F-10（通知基準日）
 */

import type { BillingCycle } from './billingCycle';

function toLocalDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addBillingCycle(startDate: Date, cycle: BillingCycle, count: number): Date {
  const base = toLocalDateOnly(startDate);
  switch (cycle) {
    case 'monthly':
      return new Date(base.getFullYear(), base.getMonth() + count, base.getDate());
    case 'yearly':
      return new Date(base.getFullYear() + count, base.getMonth(), base.getDate());
    case 'weekly': {
      const next = new Date(base);
      next.setDate(next.getDate() + count * 7);
      return next;
    }
  }
}

/**
 * 契約開始日とサイクルから「今日以降の最初の請求日」を求める。
 * start_date が今日以降なら start_date をそのまま返す。
 */
export function calcNextBillingDate(
  startDate: Date,
  cycle: BillingCycle,
  today: Date = new Date()
): Date {
  const start = toLocalDateOnly(startDate);
  const todayOnly = toLocalDateOnly(today);

  if (start >= todayOnly) {
    return start;
  }

  let count = 1;
  while (true) {
    const candidate = addBillingCycle(start, cycle, count);
    if (candidate >= todayOnly) {
      return candidate;
    }
    count += 1;
  }
}
