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

const AUTH_ERROR_CODE_MESSAGES: Record<string, string> = {
  invalid_credentials: 'メールアドレスまたはパスワードが正しくありません',
  email_not_confirmed: 'メールアドレスの確認が完了していません。確認メールをご確認ください',
  user_already_exists: 'このメールアドレスは既に登録されています',
  weak_password: '8 文字以上の英数字を入力してください',
  over_email_send_rate_limit: 'メール送信の上限に達しました。しばらく待ってからお試しください',
  over_request_rate_limit: 'リクエストが多すぎます。しばらく待ってからお試しください',
  signup_disabled: '新規登録は現在受け付けていません',
  email_address_invalid: '正しいメールアドレスを入力してください',
  validation_failed: '入力内容に誤りがあります',
  same_password: '新しいパスワードは現在のパスワードと異なる必要があります',
  user_not_found: 'ユーザーが見つかりません',
};

const AUTH_ERROR_MESSAGE_PATTERNS: { pattern: RegExp; message: string }[] = [
  {
    pattern: /invalid login credentials/i,
    message: 'メールアドレスまたはパスワードが正しくありません',
  },
  {
    pattern: /email not confirmed/i,
    message: 'メールアドレスの確認が完了していません。確認メールをご確認ください',
  },
  {
    pattern: /user already registered/i,
    message: 'このメールアドレスは既に登録されています',
  },
  {
    pattern: /password should be at least/i,
    message: '8 文字以上の英数字を入力してください',
  },
  {
    pattern: /invalid format/i,
    message: '正しいメールアドレスを入力してください',
  },
  {
    pattern: /rate limit|too many requests/i,
    message: 'リクエストが多すぎます。しばらく待ってからお試しください',
  },
  {
    pattern: /redirect|redirect_to/i,
    message: '認証の設定に問題があります。しばらくしてからお試しください',
  },
  {
    pattern: /database error|trigger/i,
    message: '登録処理に失敗しました。しばらくしてからお試しください',
  },
  {
    pattern: /network|fetch failed/i,
    message: '通信に失敗しました。ネットワークを確認してください',
  },
];

/** 認証エラーをユーザー向けの日本語メッセージに変換する。 */
export function toAuthUserMessage(error: unknown): string {
  if (error instanceof AuthCancelledError) {
    return '';
  }
  if (error instanceof AuthValidationError) {
    return error.message;
  }
  if (error instanceof Error) {
    const code = getAuthErrorCode(error);
    if (code && AUTH_ERROR_CODE_MESSAGES[code]) {
      return AUTH_ERROR_CODE_MESSAGES[code];
    }
    const matched = AUTH_ERROR_MESSAGE_PATTERNS.find(({ pattern }) => pattern.test(error.message));
    if (matched) {
      return matched.message;
    }
    if (containsJapanese(error.message)) {
      return error.message;
    }
  }
  return '認証に失敗しました。もう一度お試しください';
}

function getAuthErrorCode(error: Error): string | undefined {
  const maybeCode = (error as Error & { code?: unknown }).code;
  return typeof maybeCode === 'string' ? maybeCode : undefined;
}

function containsJapanese(text: string): boolean {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(text);
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
