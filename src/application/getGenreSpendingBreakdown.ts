import {
  computeGenreSpendingBreakdown,
  type GenreSpendingBreakdown,
} from '@/src/domain/spendingByGenre';
import type { FxRateRepository } from '@/src/ports/fxRateRepository';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

import { getExchangeRates } from './getExchangeRates';

export async function getGenreSpendingBreakdown(
  repository: SubscriptionRepository,
  fxRateRepository: FxRateRepository
): Promise<GenreSpendingBreakdown> {
  const [subscriptions, { rates }] = await Promise.all([
    repository.findAll(),
    getExchangeRates(fxRateRepository),
  ]);
  return computeGenreSpendingBreakdown(subscriptions, rates);
}
