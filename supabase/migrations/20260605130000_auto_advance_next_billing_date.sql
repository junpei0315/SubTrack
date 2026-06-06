-- ============================================================================
-- next_billing_date の自動繰り上げ（F-10 の基準日メンテナンス）
-- 目的: 請求日を過ぎた active な契約の next_billing_date を、
--       start_date（契約開始日）とサイクルを基準に「今日以降の最初の請求日」へ更新する。
-- 方式: 計算用の純粋関数 + 一括更新関数 + pg_cron による毎日実行。
-- 補足: start_date を起点に n 周期を加算することで、毎月の請求日（例: 15 日）を維持し、
--       月末 clamp によるドリフト（1/31 → 2/28 → 3/28 ...）を防ぐ。
-- ============================================================================

-- 1. 単一契約の「今日以降の最初の請求日」を求める純粋関数
CREATE OR REPLACE FUNCTION public.calc_next_billing_date(
    p_start_date DATE,
    p_cycle TEXT,
    p_today DATE
)
RETURNS DATE
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_interval INTERVAL;
    v_next DATE := p_start_date;
    v_n INTEGER := 0;
BEGIN
    v_interval := CASE p_cycle
        WHEN 'monthly' THEN INTERVAL '1 month'
        WHEN 'yearly' THEN INTERVAL '1 year'
        WHEN 'weekly' THEN INTERVAL '1 week'
        ELSE INTERVAL '1 month'
    END;

    -- 開始日が未来、または今日ちょうどならそのまま
    IF v_next >= p_today THEN
        RETURN v_next;
    END IF;

    -- start_date を起点に周期を加算し、今日以降になる最初の日を探す
    WHILE v_next < p_today LOOP
        v_n := v_n + 1;
        v_next := (p_start_date + (v_n * v_interval))::DATE;
    END LOOP;

    RETURN v_next;
END;
$$;

-- 2. 期限切れの active 契約をまとめて更新する関数（戻り値: 更新件数）
CREATE OR REPLACE FUNCTION public.refresh_due_billing_dates()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_today DATE := (now() AT TIME ZONE 'Asia/Tokyo')::DATE;
    v_count INTEGER;
BEGIN
    UPDATE subscriptions s
    SET next_billing_date = public.calc_next_billing_date(s.start_date, c.name, v_today),
        updated_at = now()
    FROM plans p
    JOIN cycles c ON c.id = p.cycle_id
    WHERE s.plan_id = p.id
      AND s.status = 'active'
      AND s.next_billing_date < v_today;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$;

-- 3. pg_cron で毎日実行（JST 0:10 ≒ UTC 15:10）
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-due-billing-dates') THEN
        PERFORM cron.unschedule('refresh-due-billing-dates');
    END IF;

    PERFORM cron.schedule(
        'refresh-due-billing-dates',
        '10 15 * * *',
        $cron$ SELECT public.refresh_due_billing_dates(); $cron$
    );
END;
$$;

-- 4. 適用直後に一度反映（過去日付の既存データを今日基準へ揃える）
SELECT public.refresh_due_billing_dates();
