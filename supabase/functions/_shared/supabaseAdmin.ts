// service_role の Supabase クライアント（Edge Functions 専用）。
// RLS をバイパスして連携確定・利用記録の書き込みを行うため、
// この鍵は Edge の環境変数のみに置く（クライアントへは絶対に出さない）。

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

export function createAdminClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !serviceRoleKey) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません');
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Asia/Tokyo の「今日」を YYYY-MM-DD で返す。 */
export function todayInTokyo(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}
