/**
 * ホーム画面の「次回支払いが近いサブスク」抽出ロジック。
 * ドメイン層なので React / Supabase などには依存しない。
 *
 * 関連機能: 028_Home（Home にサブスク一覧を表示）
 */

import type { Subscription } from './subscription';

/**
 * 次回支払日が近い順に並べ、先頭から limit 件を返す。
 * 解約済み（cancelled）は支払い予定が無いため除外する。
 * 元配列は変更しない（純粋関数）。
 */
export function getUpcomingSubscriptions(
  subscriptions: Subscription[],
  limit: number
): Subscription[] {
  return subscriptions
    .filter((subscription) => subscription.status !== 'cancelled')
    .slice()
    .sort((a, b) => a.nextBillingDate.getTime() - b.nextBillingDate.getTime())
    .slice(0, Math.max(0, limit));
}
