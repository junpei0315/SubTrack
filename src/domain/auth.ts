/**
 * 認証に関するドメイン型と純粋関数。
 * React / Supabase 等の外部 I/O には依存しない。
 *
 * 関連機能: F-14（アカウント管理：メール/PW 変更・退会）, ログイン全般
 */

export interface AuthUser {
  id: string;
  email: string | null;
}

export interface AuthSession {
  user: AuthUser;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

/** 入力値が認証要件を満たさないときに投げるドメインエラー。 */
export class AuthValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthValidationError';
  }
}

/** ユーザーが OAuth フローを途中でキャンセルしたことを表すエラー。 */
export class AuthCancelledError extends Error {
  constructor(message = '認証がキャンセルされました') {
    super(message);
    this.name = 'AuthCancelledError';
  }
}

// RFC 5322 を厳密に網羅しない実務的なメール形式チェック。
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** メールアドレスの形式を検証する。 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return { valid: false, message: 'メールアドレスを入力してください' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, message: '正しいメールアドレスを入力してください' };
  }
  return { valid: true };
}

/**
 * パスワードの強度を検証する（F-14: 8 文字以上の英数字）。
 * 英字と数字をそれぞれ 1 文字以上含むことを要件とする。
 */
export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { valid: false, message: '8 文字以上の英数字を入力してください' };
  }
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  if (!hasLetter || !hasDigit) {
    return { valid: false, message: '8 文字以上の英数字を入力してください' };
  }
  return { valid: true };
}
