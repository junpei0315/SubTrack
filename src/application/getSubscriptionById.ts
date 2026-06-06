import type { Subscription } from '@/src/domain/subscription';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export async function getSubscriptionById(
  repository: SubscriptionRepository,
  id: string
): Promise<Subscription | null> {
  return repository.findById(id);
}
