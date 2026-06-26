import type { BillingCycle } from '@/src/domain/billingCycle';
import { calcNextBillingDate } from '@/src/domain/nextBillingDate';
import { getRegisteredPlanIds, isPlanRegistered } from '@/src/domain/registeredPlanIds';
import type { Subscription } from '@/src/domain/subscription';
import type { CreateSubscriptionInput, SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export const DUPLICATE_PLAN_ERROR = 'DUPLICATE_PLAN';

export interface CreateSubscriptionFromPresetParams {
  userId: string;
  planId: string;
  planPrice: number;
  cycle: BillingCycle;
  startDate: Date;
  /** ユーザーが入力した実際の料金 */
  price: number;
  /** 052: お試し終了日 */
  trialEndsOn?: Date;
}

// subscriptions.custom_price は numeric(14,4)。比較・保存をこの精度に揃える。
function normalizePrice(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function assertValidPrice(label: string, value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be a finite non-negative number`);
  }
}

/**
 * F-01: プリセット選択からサブスク契約を登録する。
 * 料金がプリセットと異なる場合は custom_price として保存する。
 */
export async function createSubscriptionFromPreset(
  repository: SubscriptionRepository,
  params: CreateSubscriptionFromPresetParams
): Promise<Subscription> {
  assertValidPrice('price', params.price);
  assertValidPrice('planPrice', params.planPrice);

  const existing = await repository.findAll();
  const registeredPlanIds = getRegisteredPlanIds(existing);
  if (isPlanRegistered(params.planId, registeredPlanIds)) {
    throw new Error(DUPLICATE_PLAN_ERROR);
  }

  const nextBillingDate =
    params.trialEndsOn != null
      ? params.trialEndsOn
      : calcNextBillingDate(params.startDate, params.cycle);

  // 浮動小数誤差で「同額」が custom_price 扱いにならないよう、DB 精度に丸めてから比較する。
  const normalizedPrice = normalizePrice(params.price);
  const normalizedPlanPrice = normalizePrice(params.planPrice);
  const customPrice =
    normalizedPrice !== normalizedPlanPrice ? normalizedPrice : undefined;

  const input: CreateSubscriptionInput = {
    userId: params.userId,
    planId: params.planId,
    startDate: params.startDate,
    nextBillingDate,
    customPrice,
    trialEndsOn: params.trialEndsOn,
  };

  return repository.create(input);
}
