import { AuthValidationError, validateEmail } from '@/src/domain/auth';
import type { AuthRepository } from '@/src/ports/authRepository';

/**
 * メール + パスワードでサインインする。
 * メール形式のみ事前検証し、認証可否は repository（Supabase）に委ねる。
 */
export async function signInWithEmail(
  repository: AuthRepository,
  email: string,
  password: string
): Promise<void> {
  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    throw new AuthValidationError(emailResult.message ?? 'メールアドレスが不正です');
  }
  if (password.length === 0) {
    throw new AuthValidationError('パスワードを入力してください');
  }

  await repository.signInWithEmail(email, password);
}
