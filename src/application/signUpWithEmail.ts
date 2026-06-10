import { AuthValidationError, validateEmail, validatePassword } from '@/src/domain/auth';
import type { AuthRepository, SignUpResult } from '@/src/ports/authRepository';

/**
 * メール + パスワードで新規登録する。
 * メール形式・パスワード強度（F-14）を検証してから repository に委ねる。
 */
export async function signUpWithEmail(
  repository: AuthRepository,
  email: string,
  password: string
): Promise<SignUpResult> {
  const emailResult = validateEmail(email);
  if (!emailResult.valid) {
    throw new AuthValidationError(emailResult.message ?? 'メールアドレスが不正です');
  }
  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    throw new AuthValidationError(passwordResult.message ?? 'パスワードが不正です');
  }

  return repository.signUpWithEmail(email, password);
}
