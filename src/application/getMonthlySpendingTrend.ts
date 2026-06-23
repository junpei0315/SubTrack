import {
  computeMonthlySpendingTrend,
  type MonthlySpendingTrend,
  type MonthlySpendingTrendOptions,
} from '@/src/domain/monthlySpendingTrend';
import type { FxRateRepository } from '@/src/ports/fxRateRepository';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

import { getExchangeRates } from './getExchangeRates';

export async function getMonthlySpendingTrend(
  repository: SubscriptionRepository,
  fxRateRepository: FxRateRepository,
  options?: MonthlySpendingTrendOptions
): Promise<MonthlySpendingTrend> {
  const [subscriptions, { rates }] = await Promise.all([
    repository.findAll(),
    getExchangeRates(fxRateRepository),
  ]);
  return computeMonthlySpendingTrend(subscriptions, rates, options);
}
