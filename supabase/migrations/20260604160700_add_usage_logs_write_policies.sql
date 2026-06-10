-- ============================================================================
-- USAGE_LOGS の書き込み RLS ポリシー追加
-- 目的: F-08（利用チェック）/ F-09（利用頻度）で、ユーザーが自分の利用記録を
--       追加・取り消しできるようにする。
-- 既存: SELECT ポリシーは create_initial_tables で定義済み。
--       ここでは INSERT / DELETE を自分の行（auth.uid() = user_id）に限定して許可する。
-- ============================================================================

CREATE POLICY "Users can insert their own usage logs" ON USAGE_LOGS
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own usage logs" ON USAGE_LOGS
    FOR DELETE
    USING (auth.uid() = user_id);
