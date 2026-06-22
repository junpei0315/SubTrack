import {
  computeActiveMonthlyTotal,
  computeActiveYearlyTotal,
  type BillingTotal,
} from '@/src/domain/billingTotals';
import type { FxRateRepository } from '@/src/ports/fxRateRepository';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

import { getExchangeRates } from './getExchangeRates';

export type BillingPeriod = 'month' | 'year';

/**
 * 契約中サブスクの合計支出（F-05）。
 * 月額表示は月額換算、年額表示は年額換算で集計する。
 * 異なる通貨は JPY に換算してから合算する（F-13）。
 */
export async function getActiveBillingTotal(
  repository: SubscriptionRepository,
  fxRateRepository: FxRateRepository,
  period: BillingPeriod
): Promise<BillingTotal> {
  const subscriptions = await repository.findAll();
  const { rates } = await getExchangeRates(fxRateRepository);

  return period === 'year'
    ? computeActiveYearlyTotal(subscriptions, rates)
    : computeActiveMonthlyTotal(subscriptions, rates);
}
