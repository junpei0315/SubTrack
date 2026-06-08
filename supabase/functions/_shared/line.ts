// LINE Messaging API ヘルパー（Deno / Edge Functions 共有）。
// 署名検証・reply / push 送信・利用確認用 Flex メッセージ生成をまとめる。

const LINE_API_BASE = 'https://api.line.me/v2/bot';

export interface LineSubscriptionItem {
  subscriptionId: string;
  serviceName: string;
  planName?: string;
}

/**
 * Webhook の署名（X-Line-Signature）を検証する。
 * channelSecret を鍵に、生のリクエストボディを HMAC-SHA256 して base64 した値と比較する。
 */
export async function verifyLineSignature(
  channelSecret: string,
  rawBody: string,
  signature: string | null
): Promise<boolean> {
  if (!signature) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(channelSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));

  return expected === signature;
}

async function callLineApi(
  accessToken: string,
  path: string,
  payload: unknown
): Promise<void> {
  const res = await fetch(`${LINE_API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`LINE API ${path} failed: ${res.status} ${detail}`);
  }
}

/** 応答メッセージ（無料）。Webhook の replyToken に対して返す。 */
export async function replyText(
  accessToken: string,
  replyToken: string,
  text: string
): Promise<void> {
  await callLineApi(accessToken, '/message/reply', {
    replyToken,
    messages: [{ type: 'text', text }],
  });
}

/** プッシュメッセージ（課金対象）。指定の LINE userId に送る。 */
export async function pushMessages(
  accessToken: string,
  to: string,
  messages: unknown[]
): Promise<void> {
  await callLineApi(accessToken, '/message/push', { to, messages });
}

/**
 * 「今日使った？」の確認 Flex メッセージを組み立てる。
 * サブスクごとに 1 バブル（使った / 使ってない の postback ボタン）を持つカルーセル。
 * postback.data は line-webhook 側で解析する: action=usage&sub=<id>&date=<YYYY-MM-DD>&used=1|0
 */
export function buildUsagePrompt(items: LineSubscriptionItem[], usedDate: string): unknown {
  const bubbles = items.slice(0, 12).map((item) => ({
    type: 'bubble',
    size: 'kilo',
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'md',
      backgroundColor: '#1A1A1A',
      paddingAll: '16px',
      cornerRadius: '12px',
      contents: [
        { type: 'text', text: item.serviceName, weight: 'bold', size: 'md', wrap: true, color: '#FFFFFF' },
        ...(item.planName
          ? [{ type: 'text', text: item.planName, size: 'sm', wrap: true, color: '#CCCCCC' }]
          : []),
        { type: 'text', text: usedDate, size: 'xs', color: '#999999' },
        {
          type: 'box',
          layout: 'vertical',
          spacing: 'sm',
          margin: 'md',
          contents: [
            {
              type: 'button',
              style: 'primary',
              color: '#DC052D',
              height: 'sm',
              action: {
                type: 'postback',
                label: '使った',
                data: `action=usage&sub=${item.subscriptionId}&date=${usedDate}&used=1`,
                displayText: `${item.serviceName}: 使った`,
              },
            },
            {
              type: 'button',
              style: 'primary',
              color: '#2C2C2C',
              height: 'sm',
              action: {
                type: 'postback',
                label: '使ってない',
                data: `action=usage&sub=${item.subscriptionId}&date=${usedDate}&used=0`,
                displayText: `${item.serviceName}: 使ってない`,
              },
            },
          ],
        },
      ],
    },
    styles: {
      body: { backgroundColor: '#000000' },
    },
  }));

  return {
    type: 'flex',
    altText: `今日（${usedDate}）使ったサブスクを記録しましょう`,
    contents: { type: 'carousel', contents: bubbles },
  };
}
