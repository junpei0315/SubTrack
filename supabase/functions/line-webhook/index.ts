// LINE Webhook 受け口。
// - 署名検証（X-Line-Signature）
// - テキスト = 連携コード照合 → line_links 作成
// - postback = 利用実績の記録/取り消し（usage_logs）
// 返信はすべて応答メッセージ（無料）で行う。
//
// 環境変数（supabase secrets set）:
//   LINE_CHANNEL_SECRET, LINE_CHANNEL_ACCESS_TOKEN
//   SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY は Supabase が自動注入。
// この関数は verify_jwt = false でデプロイし、署名で保護する。

import { createAdminClient } from '../_shared/supabaseAdmin.ts';
import { replyText, verifyLineSignature } from '../_shared/line.ts';

const UNIQUE_VIOLATION = '23505';

interface LineEvent {
  type: string;
  replyToken?: string;
  source?: { userId?: string };
  message?: { type: string; text?: string };
  postback?: { data?: string };
}

function parsePostback(data: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const pair of data.split('&')) {
    const [key, value] = pair.split('=');
    if (key) {
      params[key] = decodeURIComponent(value ?? '');
    }
  }
  return params;
}

async function handleLinkCode(
  admin: ReturnType<typeof createAdminClient>,
  accessToken: string,
  event: LineEvent,
  code: string
): Promise<void> {
  const lineUserId = event.source?.userId;
  const replyToken = event.replyToken;
  if (!lineUserId || !replyToken) {
    return;
  }

  const { data: codeRow } = await admin
    .from('line_link_codes')
    .select('user_id, expires_at')
    .eq('code', code)
    .maybeSingle();

  if (!codeRow || new Date(codeRow.expires_at as string) < new Date()) {
    await replyText(accessToken, replyToken, 'コードが無効か期限切れです。アプリで新しいコードを発行してください。');
    return;
  }

  const userId = codeRow.user_id as string;

  await admin.from('line_links').upsert(
    { user_id: userId, line_user_id: lineUserId },
    { onConflict: 'user_id' }
  );
  await admin.from('line_link_codes').delete().eq('user_id', userId);

  await replyText(accessToken, replyToken, '連携が完了しました。毎日この トークで「使った / 使ってない」を記録できます。');
}

async function handleUsagePostback(
  admin: ReturnType<typeof createAdminClient>,
  accessToken: string,
  event: LineEvent,
  params: Record<string, string>
): Promise<void> {
  const lineUserId = event.source?.userId;
  const replyToken = event.replyToken;
  if (!lineUserId || !replyToken) {
    return;
  }

  const { data: link } = await admin
    .from('line_links')
    .select('user_id')
    .eq('line_user_id', lineUserId)
    .maybeSingle();

  if (!link) {
    await replyText(accessToken, replyToken, 'アカウント未連携です。アプリの設定からコードを発行して連携してください。');
    return;
  }

  const userId = link.user_id as string;
  const subscriptionId = params.sub;
  const usedDate = params.date;
  const used = params.used === '1';

  if (!subscriptionId || !usedDate) {
    await replyText(accessToken, replyToken, '記録に必要な情報が不足しています。');
    return;
  }

  // 自分のサブスクであることを確認（なりすまし防止）
  const { data: sub } = await admin
    .from('subscriptions')
    .select('id')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (!sub) {
    await replyText(accessToken, replyToken, '対象のサブスクが見つかりませんでした。');
    return;
  }

  if (used) {
    const { error } = await admin.from('usage_logs').insert({
      user_id: userId,
      subscription_id: subscriptionId,
      used_date: usedDate,
    });
    if (error && error.code !== UNIQUE_VIOLATION) {
      throw error;
    }
    await replyText(accessToken, replyToken, `記録しました（${usedDate} 使った）。`);
  } else {
    const { error } = await admin
      .from('usage_logs')
      .delete()
      .eq('subscription_id', subscriptionId)
      .eq('used_date', usedDate);
    if (error) {
      throw error;
    }
    await replyText(accessToken, replyToken, `記録しました（${usedDate} 使ってない）。`);
  }
}

Deno.serve(async (req: Request) => {
  const channelSecret = Deno.env.get('LINE_CHANNEL_SECRET');
  const accessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
  if (!channelSecret || !accessToken) {
    return new Response('Server not configured', { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get('x-line-signature');
  const valid = await verifyLineSignature(channelSecret, rawBody, signature);
  if (!valid) {
    return new Response('Invalid signature', { status: 401 });
  }

  const admin = createAdminClient();
  const payload = JSON.parse(rawBody) as { events?: LineEvent[] };
  const events = payload.events ?? [];

  for (const event of events) {
    try {
      if (event.type === 'message' && event.message?.type === 'text') {
        const text = (event.message.text ?? '').trim();
        if (/^\d{6}$/.test(text)) {
          await handleLinkCode(admin, accessToken, event, text);
        } else if (event.replyToken) {
          await replyText(
            accessToken,
            event.replyToken,
            'アプリで発行した 6 桁のコードを送ると連携できます。'
          );
        }
      } else if (event.type === 'postback' && event.postback?.data) {
        const params = parsePostback(event.postback.data);
        if (params.action === 'usage') {
          await handleUsagePostback(admin, accessToken, event, params);
        }
      }
    } catch (err) {
      console.error('event handling failed', err);
    }
  }

  return new Response('ok', { status: 200 });
});
