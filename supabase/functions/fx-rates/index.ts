// F-13: 為替レート取得。Frankfurter（ECB 由来・API キー不要）を 1 日 1 回キャッシュして返す。
// verify_jwt: true（ログインユーザーのみ）。未デプロイ時はクライアントが Frankfurter へフォールバックする。

const FRANKFURTER_LATEST_URL = 'https://api.frankfurter.app/latest';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FETCH_TIMEOUT_MS = 10_000;

interface FrankfurterLatestResponse {
  date: string;
  rates: Record<string, number>;
}

interface ExchangeRatesPayload {
  toJpy: Record<string, number>;
  asOfDate: string;
}

let cachedRates: ExchangeRatesPayload | null = null;
let cachedAt = 0;

function buildToJpyRatesFromEurBase(eurRates: Record<string, number>): Record<string, number> {
  const jpyPerEur = eurRates.JPY;
  if (jpyPerEur == null || jpyPerEur <= 0) {
    throw new Error('JPY rate is missing');
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

async function fetchLatestRates(): Promise<ExchangeRatesPayload> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(FRANKFURTER_LATEST_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Frankfurter API failed: ${response.status}`);
    }

    const data = (await response.json()) as FrankfurterLatestResponse;
    return {
      toJpy: buildToJpyRatesFromEurBase(data.rates),
      asOfDate: data.date,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed', message: 'GET or POST only' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const now = Date.now();
    const isCacheValid = cachedRates != null && now - cachedAt < CACHE_TTL_MS;

    if (!isCacheValid) {
      cachedRates = await fetchLatestRates();
      cachedAt = now;
    }

    return new Response(
      JSON.stringify({
        rates: cachedRates,
        cached: isCacheValid,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: 'fx_rates_failed', message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
