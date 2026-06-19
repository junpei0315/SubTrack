import type { BillingCycle } from '@/src/domain/billingCycle';
import { calcNextBillingDate } from '@/src/domain/nextBillingDate';
import type { Subscription } from '@/src/domain/subscription';
import type {
  CreateSubscriptionInput,
  SubscriptionRepository,
} from '@/src/ports/subscriptionRepository';

export interface PresetSelectionInput {
  planId: string;
  cycle: BillingCycle;
  /** 支払い開始日（未指定時は呼び出し側で今日を渡す） */
  startDate: Date;
}

/**
 * F-01: 初回オンボーディングなどで、選択した複数プリセットを一括登録する。
 * 料金はプリセット（plans.price）のままとし custom_price は付けない。
 * 開始日からサイクルに応じた次回請求日を算出して保存する。
 */
export async function createSubscriptionsFromPresets(
  repository: SubscriptionRepository,
  userId: string,
  selections: PresetSelectionInput[]
): Promise<Subscription[]> {
  if (selections.length === 0) {
    return [];
  }

  const inputs: CreateSubscriptionInput[] = selections.map((selection) => ({
    userId,
    planId: selection.planId,
    startDate: selection.startDate,
    nextBillingDate: calcNextBillingDate(selection.startDate, selection.cycle),
  }));

  return repository.createMany(inputs);
}
