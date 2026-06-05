import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { AuthCancelledError, type AuthSession } from '@/src/domain/auth';
import type { AuthRepository, SignUpResult } from '@/src/ports/authRepository';

import { supabase } from './client';

// ネイティブで開いた認証ブラウザを、リダイレクト後に確実に閉じるための初期化。
WebBrowser.maybeCompleteAuthSession();

function toAuthSession(session: Session | null): AuthSession | null {
  if (!session) {
    return null;
  }
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? null,
    },
  };
}

// OAuth リダイレクト URL に含まれる認可コードからセッションを確立する（PKCE）。
async function createSessionFromUrl(url: string): Promise<void> {
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

export const authRepositorySupabase: AuthRepository = {
  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw error;
    }
    return toAuthSession(data.session);
  },

  async signInWithEmail(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      throw error;
    }
  },

  async signUpWithEmail(email: string, password: string): Promise<SignUpResult> {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) {
      throw error;
    }
    // メール確認が有効な場合は session が null で返る。
    return { needsEmailConfirmation: data.session === null };
  },

  async signInWithGoogle(): Promise<void> {
    const redirectTo = Linking.createURL('/auth/callback');

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error) {
      throw error;
    }
    if (!data.url) {
      throw new Error('Google 認証 URL を取得できませんでした');
    }

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

    if (result.type === 'success') {
      await createSessionFromUrl(result.url);
      return;
    }
    // ユーザーがブラウザを閉じた / 戻った場合はキャンセル扱い。
    throw new AuthCancelledError();
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },

  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(toAuthSession(session));
    });
    return () => {
      data.subscription.unsubscribe();
    };
  },
};
