/**
 * 為替換算の純粋関数（F-13）。
 * HTTP やストレージには依存しない。
 */

import { formatPrice } from './money';

/** アプリの表示・集計ベース通貨 */
export const DISPLAY_CURRENCY = 'JPY';

export interface ExchangeRates {
  /** 1 単位の通貨あたりの円換算レート（JPY は常に 1） */
  toJpy: Record<string, number>;
  /** レートの基準日（ISO 8601 日付） */
  asOfDate: string;
}

export interface ExchangeRateSnapshot {
  rates: ExchangeRates;
  /** 最新レートではなくキャッシュ等を使っている */
  isStale: boolean;
}

export function roundJpyAmount(amount: number): number {
  return Math.round(amount);
}

/**
 * Frankfurter API（EUR 基準）の rates から「各通貨 → JPY」レート表を構築する。
 */
export function buildToJpyRatesFromEurBase(eurRates: Record<string, number>): Record<string, number> {
  const jpyPerEur = eurRates.JPY;
  if (jpyPerEur == null || jpyPerEur <= 0) {
    throw new Error('JPY rate is missing from EUR-based rates');
  }

  const toJpy: Record<string, number> = { JPY: 1, EUR: jpyPerEur };

  for (const [currency, unitsPerEur] of Object.entries(eurRates)) {
    if (currency === 'JPY' || unitsPerEur <= 0) {
      continue;
    }
    toJpy[currency] = jpyPerEur / unitsPerEur;
  }

  return toJpy;
}

export function convertToJpy(amount: number, fromCurrency: string, rates: ExchangeRates): number {
  if (fromCurrency === DISPLAY_CURRENCY) {
    return roundJpyAmount(amount);
  }

  const rate = rates.toJpy[fromCurrency];
  if (rate == null) {
    return roundJpyAmount(amount);
  }

  return roundJpyAmount(amount * rate);
}

/**
 * ベース通貨（JPY）での表示用文字列を返す。
 * レート未取得・未対応通貨のときは元通貨のまま表示する。
 */
export function formatDisplayPrice(
  amount: number,
  fromCurrency: string,
  rates: ExchangeRates | null
): string {
  if (fromCurrency === DISPLAY_CURRENCY) {
    return formatPrice(amount, DISPLAY_CURRENCY);
  }

  if (rates == null || rates.toJpy[fromCurrency] == null) {
    return formatPrice(amount, fromCurrency);
  }

  return formatPrice(convertToJpy(amount, fromCurrency, rates), DISPLAY_CURRENCY);
}

export const EXCHANGE_RATE_STALE_MESSAGE =
  '一部最新の為替レートが反映されていません';

/**
 * ネットワーク・キャッシュともに使えないときの最終フォールバック（F-13）。
 * プリセットで使う USD / EUR 程度をカバーする概算レート。
 */
export const FALLBACK_EXCHANGE_RATES: ExchangeRates = {
  toJpy: {
    JPY: 1,
    USD: 150,
    EUR: 163,
    GBP: 190,
  },
  asOfDate: 'fallback',
};

export function createFallbackExchangeRateSnapshot(): ExchangeRateSnapshot {
  return { rates: FALLBACK_EXCHANGE_RATES, isStale: true };
}
