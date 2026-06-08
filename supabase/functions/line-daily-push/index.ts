// 毎日 1 回、連携済みユーザーへ「今日使った？」ボタンを送るプッシュ送信。
// cron（pg_cron / 外部スケジューラ）から呼ぶ想定。コストは push 通数のみ。
// 1 ユーザー 1 通（Flex カルーセル）にまとめて通数を最小化する。
//
// 環境変数: LINE_CHANNEL_ACCESS_TOKEN（+ Supabase 自動注入の URL / service_role）
// CRON_SECRET を設定した場合は Authorization ヘッダで簡易認証する。

import { createAdminClient, todayInTokyo } from '../_shared/supabaseAdmin.ts';
import { buildUsagePrompt, pushMessages, type LineSubscriptionItem } from '../_shared/line.ts';

interface PlanRow {
  name: string;
  services: { name: string } | { name: string }[];
}

interface SubscriptionRow {
  id: string;
  plans: PlanRow | PlanRow[] | null;
}

function extractPlan(row: SubscriptionRow): PlanRow | null {
  const plans = row.plans;
  if (!plans) {
    return null;
  }
  return Array.isArray(plans) ? (plans[0] ?? null) : plans;
}

function extractServiceName(row: SubscriptionRow): string {
  const plan = extractPlan(row);
  if (!plan) {
    return 'サブスク';
  }
  const services = Array.isArray(plan.services) ? plan.services[0] : plan.services;
  return services?.name ?? 'サブスク';
}

function extractPlanName(row: SubscriptionRow): string | undefined {
  return extractPlan(row)?.name ?? undefined;
}

Deno.serve(async (req: Request) => {
  const accessToken = Deno.env.get('LINE_CHANNEL_ACCESS_TOKEN');
  if (!accessToken) {
    return new Response('Server not configured', { status: 500 });
  }

  const cronSecret = Deno.env.get('CRON_SECRET');
  if (cronSecret && req.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const admin = createAdminClient();
  const usedDate = todayInTokyo();

  const { data: links, error: linksError } = await admin
    .from('line_links')
    .select('user_id, line_user_id');

  if (linksError) {
    console.error('failed to load line_links', linksError);
    return new Response('error', { status: 500 });
  }

  let pushed = 0;

  for (const link of links ?? []) {
    const userId = link.user_id as string;
    const lineUserId = link.line_user_id as string;

    const { data: subs, error: subsError } = await admin
      .from('subscriptions')
      .select('id, plans ( name, services ( name ) )')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (subsError) {
      console.error('failed to load subscriptions', userId, subsError);
      continue;
    }

    const items: LineSubscriptionItem[] = (subs ?? []).map((row) => ({
      subscriptionId: (row as unknown as SubscriptionRow).id,
      serviceName: extractServiceName(row as unknown as SubscriptionRow),
      planName: extractPlanName(row as unknown as SubscriptionRow),
    }));

    if (items.length === 0) {
      continue;
    }

    try {
      await pushMessages(accessToken, lineUserId, [buildUsagePrompt(items, usedDate)]);
      pushed += 1;
    } catch (err) {
      console.error('push failed', lineUserId, err);
    }
  }

  return new Response(JSON.stringify({ pushed, date: usedDate }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
