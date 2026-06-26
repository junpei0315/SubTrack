import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { createSessionFromUrl } from '@/src/infrastructure/supabase/createSessionFromUrl';

function isAuthCallbackUrl(url: string): boolean {
  return url.includes('auth/callback');
}

function isCodeExchangeError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }
  const text = error.message.toLowerCase();
  return /invalid flow state|code verifier|already been used|invalid grant/i.test(text);
}

/**
 * OAuth / メール確認のディープリンクを受け取りセッションを確立する。
 * openAuthSessionAsync が success を返せない場合のフォールバックにも使う。
 */
export function useAuthDeepLink(): void {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    async function handleUrl(url: string | null): Promise<void> {
      if (!url || !isAuthCallbackUrl(url)) {
        return;
      }

      const parsed = Linking.parse(url);
      if (parsed.queryParams?.error) {
        return;
      }
      if (typeof parsed.queryParams?.code !== 'string') {
        return;
      }

      try {
        await createSessionFromUrl(url);
      } catch (error) {
        // openAuthSessionAsync 側で既に code を交換済みのときは無視する。
        if (!isCodeExchangeError(error)) {
          // フォールバック経路のため UI には出さず握りつぶす（callback 画面があればそちらで表示）。
        }
      }
    }

    void Linking.getInitialURL().then((url) => handleUrl(url));
    const subscription = Linking.addEventListener('url', (event) => {
      void handleUrl(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}
