import {
  computeMonthlySpendingTrend,
  type MonthlySpendingTrend,
  type MonthlySpendingTrendOptions,
} from '@/src/domain/monthlySpendingTrend';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export async function getMonthlySpendingTrend(
  repository: SubscriptionRepository,
  options?: MonthlySpendingTrendOptions
): Promise<MonthlySpendingTrend> {
  const subscriptions = await repository.findAll();
  return computeMonthlySpendingTrend(subscriptions, options);
}
