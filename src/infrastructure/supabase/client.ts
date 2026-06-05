/**
 * Supabase クライアントの初期化。
 * `.env` の EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY を使用する。
 *
 * 認証セッションは AsyncStorage に永続化し、アプリ再起動後もログイン状態を保つ。
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL as string,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      // URL からのセッション検出はネイティブで不要（OAuth は明示的に処理する）。
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  }
);

// アプリがフォアグラウンドの間だけトークンの自動更新を動かす。
// Web では AppState の active/background が安定しないため対象外とする。
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      void supabase.auth.startAutoRefresh();
    } else {
      void supabase.auth.stopAutoRefresh();
    }
  });
}
