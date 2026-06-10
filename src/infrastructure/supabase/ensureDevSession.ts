/**
 * 認証 UI 導入前のローカル開発用。
 * seed のテストユーザーでセッションを確立し、RLS 下でも subscriptions を読めるようにする。
 *
 * 有効条件: __DEV__ かつ EXPO_PUBLIC_DEV_AUTO_SIGN_IN !== 'false'
 * ユーザー: 既定は seed の dev@subtrack.local / password123（supabase/seed.sql）。
 *           本番DB検証時は EXPO_PUBLIC_DEV_TEST_EMAIL / _PASSWORD で上書きする。
 */

import { supabase } from './client';

const DEV_EMAIL = process.env.EXPO_PUBLIC_DEV_TEST_EMAIL ?? 'dev@subtrack.local';
const DEV_PASSWORD = process.env.EXPO_PUBLIC_DEV_TEST_PASSWORD ?? 'password123';

export function isDevAutoSignInEnabled(): boolean {
  if (!__DEV__) {
    return false;
  }
  return process.env.EXPO_PUBLIC_DEV_AUTO_SIGN_IN !== 'false';
}

export async function ensureDevSession(): Promise<void> {
  if (!isDevAutoSignInEnabled()) {
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session) {
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
  });

  if (error) {
    console.warn(
      '[SubTrack] Dev auto sign-in failed. Run `supabase db reset` locally or check EXPO_PUBLIC_SUPABASE_* in .env:',
      error.message
    );
  }
}
