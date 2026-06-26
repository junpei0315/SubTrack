import * as Linking from 'expo-linking';

import { supabase } from './client';

/** OAuth / メール確認リンクの URL から PKCE セッションを確立する。 */
export async function createSessionFromUrl(url: string): Promise<void> {
  const parsed = Linking.parse(url);
  const code = parsed.queryParams?.code;

  if (typeof code !== 'string') {
    throw new Error('認証コードを取得できませんでした');
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    throw error;
  }
}
