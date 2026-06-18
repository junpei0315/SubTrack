/**
 * ユーザープロフィールのドメインモデル。
 * ドメイン層なので React / Supabase などには依存しない。
 *
 * 関連機能: F-01（初回オンボーディングでのサブスク一括登録）, F-14（アカウント管理）
 */

export interface Profile {
  id: string;
  email: string;
  /** 表示通貨（profiles.display_currency） */
  displayCurrency: string;
  /** 初回オンボーディング（サブスク一括登録）を完了したか */
  onboardingCompleted: boolean;
}
