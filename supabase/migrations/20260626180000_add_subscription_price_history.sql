-- ============================================================================
-- サブスク料金の履歴（F-03: 今月から / 過去すべての料金変更）
-- 設計書: docs/DATABASE_DESIGN.md
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    price NUMERIC(14, 4) NOT NULL,
    effective_from DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT subscription_price_history_price_non_negative CHECK (price >= 0),
    CONSTRAINT subscription_price_history_subscription_effective_from_key
        UNIQUE (subscription_id, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_subscription_price_history_subscription_id
    ON subscription_price_history(subscription_id);

COMMENT ON TABLE subscription_price_history IS
    '契約料金の適用開始日ごとのスナップショット。未登録月は subscriptions.custom_price / plans.price を使用。';

ALTER TABLE subscription_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscription_price_history_select_own
    ON subscription_price_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY subscription_price_history_insert_own
    ON subscription_price_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY subscription_price_history_update_own
    ON subscription_price_history
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY subscription_price_history_delete_own
    ON subscription_price_history
    FOR DELETE
    USING (auth.uid() = user_id);
