import type { AuthSession } from '@/src/domain/auth';

/** メールサインアップの結果。 */
export interface SignUpResult {
  /** メール確認が必要でセッションが未発行のとき true（Supabase で Confirm email が有効な場合）。 */
  needsEmailConfirmation: boolean;
  /** サインアップ直後にログインセッションが発行されたとき true。 */
  hasSession: boolean;
}

/**
 * 認証セッションの取得・操作を抽象化するポート。
 * 具象実装は infrastructure 層（Supabase）に置く。
 */
export interface AuthRepository {
  /** 現在の保存済みセッションを取得する（未ログインなら null）。 */
  getSession(): Promise<AuthSession | null>;

  /** メール + パスワードでサインインする。 */
  signInWithEmail(email: string, password: string): Promise<void>;

  /** メール + パスワードで新規登録する。 */
  signUpWithEmail(email: string, password: string): Promise<SignUpResult>;

  /** Google アカウントでサインインする（OAuth）。 */
  signInWithGoogle(): Promise<void>;

  /** サインアウトする。 */
  signOut(): Promise<void>;

  /**
   * 認証状態の変化を購読する。
   * @returns 購読解除用のクリーンアップ関数
   */
  onAuthStateChange(callback: (session: AuthSession | null) => void): () => void;
}
