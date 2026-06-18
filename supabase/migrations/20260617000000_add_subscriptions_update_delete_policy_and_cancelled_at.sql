-- ============================================================================
-- サブスクの一時停止・解約・削除に必要なスキーマ / RLS を追加
-- 044: 一時停止（paused）・解約（cancelled）・削除（物理削除）機能
--
-- 1. cancelled_at: 解約日時。status='cancelled' に変更したときに now() を入れ、
--    再開・復活時は NULL に戻す。F-07（支出予測で解約済みを除外）や
--    「解約済み」一覧の並べ替え・表示に使う。
-- 2. UPDATE / DELETE の RLS ポリシー: これまで SELECT / INSERT のみで、
--    状態変更（停止・解約）や削除が DB レベルで弾かれていたため追加する。
-- ============================================================================

ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN subscriptions.cancelled_at IS
    '解約日時。status=cancelled のとき設定し、active/paused へ戻すと NULL に戻す。';

-- 既存の cancelled 行に cancelled_at が無いと CHECK 制約追加が失敗するため補完する。
UPDATE subscriptions
SET cancelled_at = COALESCE(cancelled_at, updated_at, created_at, now())
WHERE status = 'cancelled'
    AND cancelled_at IS NULL;

-- cancelled_at と status の整合を DB 側でも担保する。
-- - cancelled のときは cancelled_at が必須
-- - active / paused のときは cancelled_at は NULL
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_cancelled_at_consistency'
    ) THEN
        ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_cancelled_at_consistency
            CHECK (
                (status = 'cancelled' AND cancelled_at IS NOT NULL)
                OR (status <> 'cancelled' AND cancelled_at IS NULL)
            );
    END IF;
END $$;

-- 本人のみ自分の契約を更新できる（一時停止・再開・解約）。
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'subscriptions'
          AND policyname = 'Users can update their own subscriptions'
    ) THEN
        CREATE POLICY "Users can update their own subscriptions"
            ON subscriptions
            FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- 本人のみ自分の契約を削除できる（F-04 物理削除）。
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'subscriptions'
          AND policyname = 'Users can delete their own subscriptions'
    ) THEN
        CREATE POLICY "Users can delete their own subscriptions"
            ON subscriptions
            FOR DELETE
            USING (auth.uid() = user_id);
    END IF;
END $$;
