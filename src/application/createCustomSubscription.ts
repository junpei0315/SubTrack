import type { BillingCycle } from '@/src/domain/billingCycle';
import type { Subscription } from '@/src/domain/subscription';
import type { CreateCustomSubscriptionInput, CustomSubscriptionRepository } from '@/src/ports/customSubscriptionRepository';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export interface CreateCustomSubscriptionParams {
  serviceName: string;
  planName: string;
  price: number;
  cycle: BillingCycle;
  startDate: Date;
  currency?: string;
}

function assertValidPrice(value: number): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('price must be a finite non-negative number');
  }
}

function assertNonEmpty(label: string, value: string): void {
  if (value.trim().length === 0) {
    throw new Error(`${label} is required`);
  }
}

/**
 * F-02: プリセットにないサブスクを手動入力で登録する。
 * DB 側 RPC で service / plan / subscription を原子的に作成する。
 */
export async function createCustomSubscription(
  customRepository: CustomSubscriptionRepository,
  subscriptionRepository: SubscriptionRepository,
  params: CreateCustomSubscriptionParams
): Promise<Subscription> {
  assertNonEmpty('serviceName', params.serviceName);
  assertValidPrice(params.price);

  const input: CreateCustomSubscriptionInput = {
    serviceName: params.serviceName.trim(),
    planName: params.planName.trim(),
    price: params.price,
    cycle: params.cycle,
    startDate: params.startDate,
    currency: params.currency,
  };

  const subscriptionId = await customRepository.create(input);
  const subscription = await subscriptionRepository.findById(subscriptionId);
  if (!subscription) {
    throw new Error('created subscription not found');
  }
  return subscription;
}
