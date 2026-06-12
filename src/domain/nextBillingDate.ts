/**
 * 次回請求日の算出に関する純粋関数。
 * DB の calc_next_billing_date（start_date + n×interval、月末 clamp）と同じ結果を
 * クライアント登録時にも再現する。
 *
 * 関連機能: F-01（プリセット登録）, F-10（通知基準日）
 */

import type { BillingCycle } from './billingCycle';

function toLocalDateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** 指定した年月（0始まり）の末日を返す。 */
function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * start_date を起点に count 周期を加算する。
 * Postgres の `date + n*interval` と同様、月末・うるう日は対象月の末日へ clamp する
 * （例: 1/31 + 1 month = 2/28、2/29 + 1 year = 翌年 2/28）。
 * JS の Date は日のオーバーフローを翌月へ繰り上げてしまうため、明示的に clamp する。
 */
function addBillingCycle(startDate: Date, cycle: BillingCycle, count: number): Date {
  const base = toLocalDateOnly(startDate);
  const year = base.getFullYear();
  const monthIndex = base.getMonth();
  const day = base.getDate();

  switch (cycle) {
    case 'monthly': {
      const totalMonths = monthIndex + count;
      const targetYear = year + Math.floor(totalMonths / 12);
      const targetMonth = ((totalMonths % 12) + 12) % 12;
      const clampedDay = Math.min(day, lastDayOfMonth(targetYear, targetMonth));
      return new Date(targetYear, targetMonth, clampedDay);
    }
    case 'yearly': {
      const targetYear = year + count;
      const clampedDay = Math.min(day, lastDayOfMonth(targetYear, monthIndex));
      return new Date(targetYear, monthIndex, clampedDay);
    }
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
