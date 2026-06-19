import type { Profile } from '@/src/domain/profile';

export interface ProfileRepository {
  /** ログイン中ユーザーのプロフィールを取得する。未作成なら null。 */
  getCurrent(): Promise<Profile | null>;
  /** 初回オンボーディングを完了済みとして記録する。 */
  markOnboardingCompleted(): Promise<void>;
}
