-- ============================================================================
-- F-02 / 038: プリセットにないサブスクの手動登録
--
-- 1. services.user_id: NULL = プリセットマスタ、NOT NULL = ユーザー独自サービス
-- 2. create_custom_subscription RPC: service + plan + subscription を原子的に作成
-- 3. プリセット一覧からユーザーカスタムサービスを除外する RLS 調整
-- ============================================================================

ALTER TABLE services
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

COMMENT ON COLUMN services.user_id IS
    'NULL のときプリセットマスタ。NOT NULL のとき当該ユーザーのカスタムサービス。';

CREATE INDEX IF NOT EXISTS idx_services_user_id ON services(user_id);

-- プリセットは全員が読める。カスタムは本人のみ。
DROP POLICY IF EXISTS "Anyone can read services" ON services;

CREATE POLICY "Anyone can read preset services"
    ON services
    FOR SELECT
    TO anon, authenticated
    USING (user_id IS NULL);

CREATE POLICY "Users can read their custom services"
    ON services
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- categories.id = 17 は「その他」（src/domain/genre.ts の other と対応）
CREATE OR REPLACE FUNCTION public.create_custom_subscription(
    p_service_name TEXT,
    p_plan_name TEXT,
    p_price NUMERIC,
    p_cycle TEXT,
    p_start_date DATE,
    p_currency TEXT DEFAULT 'JPY'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_service_id UUID;
    v_plan_id UUID;
    v_subscription_id UUID;
    v_cycle_id INT;
    v_next_billing DATE;
    v_normalized_service_name TEXT;
    v_normalized_plan_name TEXT;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    v_normalized_service_name := trim(p_service_name);
    IF v_normalized_service_name = '' THEN
        RAISE EXCEPTION 'service name is required';
    END IF;

    IF p_price IS NULL OR p_price < 0 THEN
        RAISE EXCEPTION 'price must be a non-negative number';
    END IF;

    v_normalized_plan_name := COALESCE(NULLIF(trim(p_plan_name), ''), '標準');

    SELECT id INTO v_cycle_id FROM cycles WHERE name = p_cycle;
    IF v_cycle_id IS NULL THEN
        RAISE EXCEPTION 'invalid billing cycle: %', p_cycle;
    END IF;

    -- 同一ユーザーが同名の稼働中カスタムサブスクを持っていないか（F-02 重複チェック）
    IF EXISTS (
        SELECT 1
        FROM subscriptions sub
        JOIN plans pl ON pl.id = sub.plan_id
        JOIN services svc ON svc.id = pl.service_id
        WHERE sub.user_id = v_user_id
          AND svc.user_id = v_user_id
          AND lower(svc.name) = lower(v_normalized_service_name)
          AND sub.status <> 'cancelled'
    ) THEN
        RAISE EXCEPTION 'duplicate service name';
    END IF;

    INSERT INTO services (name, category_id, user_id)
    VALUES (v_normalized_service_name, 17, v_user_id)
    RETURNING id INTO v_service_id;

    INSERT INTO plans (service_id, name, price, currency, cycle_id)
    VALUES (v_service_id, v_normalized_plan_name, p_price, COALESCE(NULLIF(trim(p_currency), ''), 'JPY'), v_cycle_id)
    RETURNING id INTO v_plan_id;

    v_next_billing := public.calc_next_billing_date(
        p_start_date,
        p_cycle,
        (now() AT TIME ZONE 'Asia/Tokyo')::DATE
    );

    INSERT INTO subscriptions (
        user_id,
        plan_id,
        start_date,
        next_billing_date,
        status
    )
    VALUES (
        v_user_id,
        v_plan_id,
        p_start_date,
        v_next_billing,
        'active'
    )
    RETURNING id INTO v_subscription_id;

    RETURN v_subscription_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_custom_subscription(TEXT, TEXT, NUMERIC, TEXT, DATE, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_custom_subscription(TEXT, TEXT, NUMERIC, TEXT, DATE, TEXT) TO authenticated;
