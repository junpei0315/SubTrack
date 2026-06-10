/**
 * プリセット（人気のサブスク）マスタのドメインモデルと純粋関数。
 * ドメイン層なので React / Supabase などには依存しない。
 *
 * プリセットは「サービス（services）」＋「複数プラン（plans）」のマスタ情報。
 * F-01（プリセット選択で一括登録）の選択候補として表示する。
 */

import type { BillingCycle } from './billingCycle';

export interface PresetPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  cycle: BillingCycle;
}

export interface PresetService {
  id: string;
  name: string;
  /** 表示用のジャンル名（categories.name の日本語ラベル） */
  genre: string;
  /** 同梱ロゴの識別子（assets/services/{logoKey}.jpeg） */
  logoKey?: string;
  /** 外部ロゴ URL（logoKey が無い場合のフォールバック） */
  logoUri?: string;
  /** 画像が無い場合の UI アイコン名 */
  iconName?: string;
  plans: PresetPlan[];
}

/**
 * 一覧の月額表示に使う代表プランを選ぶ。
 * 月額（monthly）プランのうち最安を優先し、無ければ全プランの最安を返す。
 */
export function getRepresentativeMonthlyPlan(
  service: PresetService
): PresetPlan | undefined {
  if (service.plans.length === 0) {
    return undefined;
  }

  const cheapest = (plans: PresetPlan[]) =>
    plans.reduce((min, plan) => (plan.price < min.price ? plan : min));

  const monthlyPlans = service.plans.filter((plan) => plan.cycle === 'monthly');
  if (monthlyPlans.length > 0) {
    return cheapest(monthlyPlans);
  }

  return cheapest(service.plans);
}
