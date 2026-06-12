-- ============================================================================
-- subscriptions.custom_price 追加と INSERT RLS ポリシー
-- F-01: プリセット登録時にユーザーが編集した料金を契約単位で保持する。
-- NULL の場合は plans.price（プリセット価格）を表示・集計に使う。
-- ============================================================================

ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS custom_price NUMERIC(14, 4);

COMMENT ON COLUMN subscriptions.custom_price IS
    'ユーザーが編集した契約料金。NULL のときは plans.price を使用する。';

CREATE POLICY "Users can insert their own subscriptions"
    ON subscriptions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
