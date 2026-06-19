import {
  computeActiveMonthlyTotal,
  computeActiveYearlyTotal,
  type BillingTotal,
} from '@/src/domain/billingTotals';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export type BillingPeriod = 'month' | 'year';

/**
 * 契約中サブスクの合計支出（F-05）。
 * 月額表示は月額換算、年額表示は年額換算で集計する。
 */
export async function getActiveBillingTotal(
  repository: SubscriptionRepository,
  period: BillingPeriod
): Promise<BillingTotal> {
  const subscriptions = await repository.findAll();
  return period === 'year'
    ? computeActiveYearlyTotal(subscriptions)
    : computeActiveMonthlyTotal(subscriptions);
}
