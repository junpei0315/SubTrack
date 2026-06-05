import { supabase } from './client';

const DEV_TEST_EMAIL = process.env.EXPO_PUBLIC_DEV_TEST_EMAIL ?? 'test@test.com';
const DEV_TEST_PASSWORD = process.env.EXPO_PUBLIC_DEV_TEST_PASSWORD ?? 'password123';

export function isDevAutoSignInEnabled(): boolean {
  return __DEV__ && process.env.EXPO_PUBLIC_DEV_AUTO_SIGN_IN !== 'false';
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
    email: DEV_TEST_EMAIL,
    password: DEV_TEST_PASSWORD,
  });

  if (error) {
    throw error;
  }
}
