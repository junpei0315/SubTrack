-- ============================================================================
-- 052: お試し期間（trial_ends_on / default_trial_days）
-- ============================================================================

ALTER TABLE plans
    ADD COLUMN IF NOT EXISTS default_trial_days integer NULL;

ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS trial_ends_on date NULL;

COMMENT ON COLUMN plans.default_trial_days IS
    '052: プリセットプランのデフォルトお試し日数。NULL はデフォルトなし。';

COMMENT ON COLUMN subscriptions.trial_ends_on IS
    '052: お試し終了日（初回課金日）。未来日ならお試し中。NULL はお試しなし。';

-- 動画・音楽の月額プリセットに 30 日お試しをデフォルト設定
UPDATE plans p
SET default_trial_days = 30
FROM services s
JOIN categories c ON c.id = s.category_id
JOIN cycles cy ON cy.id = p.cycle_id
WHERE p.service_id = s.id
  AND s.user_id IS NULL
  AND c.name IN ('動画配信', '音楽')
  AND cy.name = 'monthly'
  AND p.default_trial_days IS NULL;

-- create_custom_subscription にお試し終了日を追加
DROP FUNCTION IF EXISTS public.create_custom_subscription(TEXT, TEXT, NUMERIC, TEXT, DATE, TEXT);

CREATE OR REPLACE FUNCTION public.create_custom_subscription(
    p_service_name TEXT,
    p_plan_name TEXT,
    p_price NUMERIC,
    p_cycle TEXT,
    p_start_date DATE,
    p_currency TEXT DEFAULT 'JPY',
    p_trial_ends_on DATE DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_service_id uuid;
    v_plan_id uuid;
    v_subscription_id uuid;
    v_cycle_id integer;
    v_next_billing date;
    v_normalized_service_name text := trim(p_service_name);
    v_normalized_plan_name text := COALESCE(NULLIF(trim(p_plan_name), ''), 'カスタム');
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    IF v_normalized_service_name = '' THEN
        RAISE EXCEPTION 'service name is required';
    END IF;

    IF p_price < 0 THEN
        RAISE EXCEPTION 'price must be non-negative';
    END IF;

    SELECT id INTO v_cycle_id FROM cycles WHERE name = p_cycle;
    IF v_cycle_id IS NULL THEN
        RAISE EXCEPTION 'invalid billing cycle: %', p_cycle;
    END IF;

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

    IF p_trial_ends_on IS NOT NULL THEN
        v_next_billing := p_trial_ends_on;
    ELSE
        v_next_billing := public.calc_next_billing_date(
            p_start_date,
            p_cycle,
            (now() AT TIME ZONE 'Asia/Tokyo')::DATE
        );
    END IF;

    INSERT INTO subscriptions (
        user_id,
        plan_id,
        start_date,
        next_billing_date,
        trial_ends_on,
        status
    )
    VALUES (
        v_user_id,
        v_plan_id,
        p_start_date,
        v_next_billing,
        p_trial_ends_on,
        'active'
    )
    RETURNING id INTO v_subscription_id;

    RETURN v_subscription_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_custom_subscription(TEXT, TEXT, NUMERIC, TEXT, DATE, TEXT, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_custom_subscription(TEXT, TEXT, NUMERIC, TEXT, DATE, TEXT, DATE) TO authenticated;
