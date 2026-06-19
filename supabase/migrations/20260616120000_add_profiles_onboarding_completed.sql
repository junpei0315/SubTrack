-- ============================================================================
-- profiles.onboarding_completed 追加（初回ログインのオンボーディング判定）
-- ----------------------------------------------------------------------------
-- 背景:
--   サインアップ直後の初回ログインで「使っているサブスクをまとめて登録する」
--   オンボーディング画面を表示するため、完了済みかどうかをサーバー側で保持する。
--   false の間はオンボーディングへ、完了（または登録済み）なら通常のホームへ遷移する。
-- 設計書: docs/DATABASE_DESIGN.md（PROFILES）／docs/FEATURE_REQUIREMENTS.md F-01
-- ============================================================================

ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.onboarding_completed IS
    '初回オンボーディング（サブスク一括登録）を完了したか。false の間はオンボーディング画面を表示する。';

-- 自分のプロフィールを更新（オンボーディング完了の記録）できるようにする。
-- 初期マイグレーションでは SELECT のみだったため UPDATE ポリシーを追加する。
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
    ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 既にサブスクを登録済みのユーザーは初回オンボーディング不要とみなして完了扱いにする
-- （本機能導入前から利用しているユーザーへ突然オンボーディングを出さないため）。
UPDATE profiles p
SET onboarding_completed = true
WHERE EXISTS (
    SELECT 1 FROM subscriptions s WHERE s.user_id = p.id
);
