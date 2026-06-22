import type { ExchangeRateSnapshot } from '@/src/domain/exchangeRate';
import type { FxRateRepository } from '@/src/ports/fxRateRepository';

export async function getExchangeRates(
  repository: FxRateRepository
): Promise<ExchangeRateSnapshot> {
  return repository.getRates();
}
