import type { BillingCycle } from '@/src/domain/billingCycle';
import { calcNextBillingDate } from '@/src/domain/nextBillingDate';
import type { Subscription } from '@/src/domain/subscription';
import type { CreateSubscriptionInput, SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export interface CreateSubscriptionFromPresetParams {
  userId: string;
  planId: string;
  planPrice: number;
  cycle: BillingCycle;
  startDate: Date;
  /** ユーザーが入力した実際の料金 */
  price: number;
}

/**
 * F-01: プリセット選択からサブスク契約を登録する。
 * 料金がプリセットと異なる場合は custom_price として保存する。
 */
export async function createSubscriptionFromPreset(
  repository: SubscriptionRepository,
  params: CreateSubscriptionFromPresetParams
): Promise<Subscription> {
  const nextBillingDate = calcNextBillingDate(params.startDate, params.cycle);
  const customPrice = params.price !== params.planPrice ? params.price : undefined;

  const input: CreateSubscriptionInput = {
    userId: params.userId,
    planId: params.planId,
    startDate: params.startDate,
    nextBillingDate,
    customPrice,
  };

  return repository.create(input);
}
