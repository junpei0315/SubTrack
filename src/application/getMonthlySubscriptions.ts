import type { Subscription } from '@/src/domain/subscription';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export async function getMonthlySubscriptions(
  repository: SubscriptionRepository,
  year: number,
  month: number
): Promise<Subscription[]> {
  return repository.findByBillingMonth(year, month);
}
