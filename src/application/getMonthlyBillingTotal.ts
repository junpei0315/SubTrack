import {
  computeActiveMonthlyTotal,
  type BillingTotal,
} from '@/src/domain/billingTotals';
import type { FxRateRepository } from '@/src/ports/fxRateRepository';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

import { getExchangeRates } from './getExchangeRates';

/**
 * 契約中サブスクの月額換算合計を算出するユースケース（F-05）。
 */
export async function getMonthlyBillingTotal(
  repository: SubscriptionRepository,
  fxRateRepository: FxRateRepository
): Promise<BillingTotal> {
  const [subscriptions, { rates }] = await Promise.all([
    repository.findAll(),
    getExchangeRates(fxRateRepository),
  ]);
  return computeActiveMonthlyTotal(subscriptions, rates);
}
