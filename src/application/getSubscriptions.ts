import type { Subscription } from '@/src/domain/subscription';
import { isTrialEnded } from '@/src/domain/trialPeriod';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export async function getSubscriptions(
  repository: SubscriptionRepository
): Promise<Subscription[]> {
  const subscriptions = await repository.findAll();
  const expiredTrialIds = subscriptions
    .filter((subscription) => isTrialEnded(subscription))
    .map((subscription) => subscription.id);

  if (expiredTrialIds.length > 0) {
    await repository.clearExpiredTrials(expiredTrialIds);
  }

  if (expiredTrialIds.length === 0) {
    return subscriptions;
  }

  const expiredSet = new Set(expiredTrialIds);
  return subscriptions.map((subscription) =>
    expiredSet.has(subscription.id) ? { ...subscription, trialEndsOn: undefined } : subscription
  );
}
