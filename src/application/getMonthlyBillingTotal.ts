import {
  computeActiveMonthlyTotal,
  type BillingTotal,
} from '@/src/domain/billingTotals';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

/**
 * 契約中サブスクの月額換算合計を算出するユースケース（F-05）。
 */
export async function getMonthlyBillingTotal(
  repository: SubscriptionRepository
): Promise<BillingTotal> {
  const subscriptions = await repository.findAll();
  return computeActiveMonthlyTotal(subscriptions);
}
