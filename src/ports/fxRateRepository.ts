import type { ExchangeRateSnapshot } from '@/src/domain/exchangeRate';

export interface FxRateRepository {
  /** 表示通貨（JPY）への換算レートを取得する */
  getRates(): Promise<ExchangeRateSnapshot>;
}
