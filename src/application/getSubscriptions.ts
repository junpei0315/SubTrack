import type { Subscription } from '@/src/domain/subscription';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export async function getSubscriptions(
  repository: SubscriptionRepository
): Promise<Subscription[]> {
  return repository.findAll();
}
