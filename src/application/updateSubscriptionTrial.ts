import { calcNextBillingDate, toLocalDateOnly } from '@/src/domain/nextBillingDate';
import type { Subscription } from '@/src/domain/subscription';
import type {
  SubscriptionRepository,
  UpdateSubscriptionTrialInput,
} from '@/src/ports/subscriptionRepository';

export async function updateSubscriptionTrial(
  repository: SubscriptionRepository,
  subscription: Subscription,
  trialEndsOn: Date | null
): Promise<Subscription> {
  const nextBillingDate =
    trialEndsOn != null
      ? toLocalDateOnly(trialEndsOn)
      : calcNextBillingDate(subscription.startDate, subscription.plan.cycle);

  const input: UpdateSubscriptionTrialInput = {
    trialEndsOn,
    nextBillingDate,
  };

  return repository.updateTrial(subscription.id, input);
}
