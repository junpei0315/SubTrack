/**
 * Supabase クライアントの初期化。
 * `.env` の EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY を使用する。
 *
 * 認証セッションは AsyncStorage に永続化し、アプリ再起動後もログイン状態を保つ。
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

// Supabase の auth.storage が要求する最小インターフェース。
interface SupabaseAuthStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Web の SSR（expo-router の Node レンダリング）では window が無いため、
// AsyncStorage / localStorage に触れると "window is not defined" でクラッシュする。
// 実行環境に応じて安全なストレージを選ぶ。
function resolveAuthStorage(): SupabaseAuthStorage {
  // ネイティブ（iOS / Android）は従来どおり AsyncStorage。
  if (Platform.OS !== 'web') {
    return AsyncStorage;
  }

  // Web でも window が無い＝SSR 中は何も永続化しない no-op ストレージ。
  if (typeof window === 'undefined') {
    return {
      getItem: async () => null,
      setItem: async () => undefined,
      removeItem: async () => undefined,
    };
  }

  // ブラウザ実行時は localStorage を使う。
  return {
    getItem: async (key) => window.localStorage.getItem(key),
    setItem: async (key, value) => {
      window.localStorage.setItem(key, value);
    },
    removeItem: async (key) => {
      window.localStorage.removeItem(key);
    },
  };
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL as string,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
  {
    auth: {
      storage: resolveAuthStorage(),
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
