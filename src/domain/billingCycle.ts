/**
 * 請求サイクル（plan.cycle）に関する純粋関数。
 * ドメイン層のため React / Supabase 等には依存しない。
 *
 * 関連機能: F-02（カスタム新規追加・サイクル指定）, F-05（合計金額計算）
 */

import type { Plan } from './subscription';

export type BillingCycle = Plan['cycle'];

const CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: '毎月',
  yearly: '毎年',
  weekly: '毎週',
};

export function getBillingCycleLabel(cycle: BillingCycle): string {
  return CYCLE_LABELS[cycle];
}

/**
 * Date を `YYYY/MM/DD` 形式の文字列に整形する（端末ローカルタイム基準）。
 */
export function formatBillingDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}
