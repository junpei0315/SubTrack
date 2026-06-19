import {
  computeGenreSpendingBreakdown,
  type GenreSpendingBreakdown,
} from '@/src/domain/spendingByGenre';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export async function getGenreSpendingBreakdown(
  repository: SubscriptionRepository
): Promise<GenreSpendingBreakdown> {
  const subscriptions = await repository.findAll();
  return computeGenreSpendingBreakdown(subscriptions);
}
