/**
 * 金額表示に関する純粋関数。
 * ドメイン層なので React / Supabase 等には依存しない。
 *
 * 関連機能: F-05（合計金額表示）, 一覧・詳細での価格表示
 */

const CURRENCY_SYMBOLS: Record<string, string> = {
  JPY: '\u00a5',
  USD: '$',
  EUR: '\u20ac',
  GBP: '\u00a3',
};

/** 表示用の通貨記号。未登録のときは通貨コードを返す。 */
export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

/**
 * 価格を通貨記号つきの文字列に整形する（例: 1490 / JPY -> "¥1,490"）。
 * 未知の通貨は通貨コードを後置する（例: 9.99 / GBP -> "9.99 GBP"）。
 */
export function formatPrice(price: number, currency: string): string {
  const grouped = price.toLocaleString('en-US');
  const symbol = CURRENCY_SYMBOLS[currency];
  return symbol != null ? `${symbol}${grouped}` : `${grouped} ${currency}`;
}
