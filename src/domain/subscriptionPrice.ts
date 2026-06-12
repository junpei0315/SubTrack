/**
 * 契約の実効料金（表示・集計用）に関する純粋関数。
 * ドメイン層なので React / Supabase 等には依存しない。
 *
 * 関連機能: F-01（プリセット登録時の料金編集）, F-05（合計金額表示）
 */

import type { Subscription } from './subscription';

/** 契約に設定されたカスタム料金があればそれを、なければプランのプリセット価格を返す。 */
export function getEffectiveSubscriptionPrice(subscription: Subscription): number {
  return subscription.customPrice ?? subscription.plan.price;
}
