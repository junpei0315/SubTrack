-- ============================================================================
-- SubTrack ローカル開発用シードデータ
-- 適用タイミング: `supabase db reset` のみ（リモートには自動適用されない）
--
-- テストユーザー（将来の認証実装用）:
--   Email   : dev@subtrack.local
--   Password: password123
--
-- 請求情報コンポーネント確認用 URL（Expo Web 例）:
--   /subscriptions/22222222-2222-2222-2222-222222222001  Netflix（毎月）
--   /subscriptions/22222222-2222-2222-2222-222222222002  Spotify（毎月）
--   /subscriptions/22222222-2222-2222-2222-222222222003  Adobe（毎年）
--   /subscriptions/22222222-2222-2222-2222-222222222004  ChatGPT Plus（毎月）
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. 開発用テストユーザー（auth.users / auth.identities / profiles）
-- --------------------------------------------------------------------------
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'dev@subtrack.local',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"dev@subtrack.local","email_verified":true}',
    'email',
    NOW(),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, email, display_currency)
VALUES ('11111111-1111-1111-1111-111111111111', 'dev@subtrack.local', 'JPY')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------------
-- 2. マスタデータ（cycles / categories / services / plans）
-- --------------------------------------------------------------------------
INSERT INTO cycles (name) VALUES
    ('monthly'),
    ('yearly'),
    ('weekly')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, color_code, icon_name) VALUES
    (1, '動画配信', '#ff3a5e', 'play-circle'),
    (2, '音楽', '#1db954', 'music'),
    (3, 'デザイン', '#ff0000', 'palette'),
    (4, 'AI', '#10a37f', 'message-circle')
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    pg_get_serial_sequence('categories', 'id'),
    (SELECT COALESCE(MAX(id), 1) FROM categories)
);

INSERT INTO services (id, name, category_id, icon_name) VALUES
    ('33333333-3333-3333-3333-333333333001', 'Netflix', 1, 'play-circle'),
    ('33333333-3333-3333-3333-333333333002', 'Spotify', 2, 'music'),
    ('33333333-3333-3333-3333-333333333003', 'Adobe Creative Cloud', 3, 'palette'),
    ('33333333-3333-3333-3333-333333333004', 'ChatGPT Plus', 4, 'message-circle')
ON CONFLICT (id) DO NOTHING;

INSERT INTO plans (id, service_id, name, price, currency, cycle_id) VALUES
    (
        '44444444-4444-4444-4444-444444444001',
        '33333333-3333-3333-3333-333333333001',
        'Premium',
        1490,
        'JPY',
        (SELECT id FROM cycles WHERE name = 'monthly')
    ),
    (
        '44444444-4444-4444-4444-444444444002',
        '33333333-3333-3333-3333-333333333002',
        'Premium',
        1180,
        'JPY',
        (SELECT id FROM cycles WHERE name = 'monthly')
    ),
    (
        '44444444-4444-4444-4444-444444444003',
        '33333333-3333-3333-3333-333333333003',
        'All Apps',
        6248,
        'JPY',
        (SELECT id FROM cycles WHERE name = 'yearly')
    ),
    (
        '44444444-4444-4444-4444-444444444004',
        '33333333-3333-3333-3333-333333333004',
        'Plus',
        2000,
        'JPY',
        (SELECT id FROM cycles WHERE name = 'monthly')
    )
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------------
-- 3. サブスク契約（start_date / next_billing_date）
--    next_billing_date は当月内の日付にしてカレンダー確認にも使えるようにする
-- --------------------------------------------------------------------------
INSERT INTO subscriptions (
    id,
    user_id,
    plan_id,
    start_date,
    next_billing_date,
    status
) VALUES
    (
        '22222222-2222-2222-2222-222222222001',
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444001',
        '2021-09-24',
        (date_trunc('month', CURRENT_DATE) + interval '4 days')::date,
        'active'
    ),
    (
        '22222222-2222-2222-2222-222222222002',
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444002',
        '2022-03-01',
        (date_trunc('month', CURRENT_DATE) + interval '11 days')::date,
        'active'
    ),
    (
        '22222222-2222-2222-2222-222222222003',
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444003',
        '2020-06-15',
        (date_trunc('month', CURRENT_DATE) + interval '19 days')::date,
        'active'
    ),
    (
        '22222222-2222-2222-2222-222222222004',
        '11111111-1111-1111-1111-111111111111',
        '44444444-4444-4444-4444-444444444004',
        '2023-11-01',
        (date_trunc('month', CURRENT_DATE) + interval '24 days')::date,
        'active'
    )
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------------------------
-- 4. 開発用 RLS 緩和（認証未実装の間、BillingInfo 確認のため anon 読み取りを許可）
--    seed はローカル db reset 時のみ実行されるため、リモート本番には影響しない
-- --------------------------------------------------------------------------
DROP POLICY IF EXISTS "dev_anon_read_subscriptions" ON subscriptions;
CREATE POLICY "dev_anon_read_subscriptions"
    ON subscriptions
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- --------------------------------------------------------------------------
-- 5. 利用ログ（usage_logs）の確認用ダミーデータ
--    Netflix（...001）に直近 90 日のうち決定的なパターンで利用日を入れる。
--    利用状況トラッカー（F-09）のヒートマップ確認用。
-- --------------------------------------------------------------------------
INSERT INTO usage_logs (user_id, subscription_id, used_date)
SELECT
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222001',
    (CURRENT_DATE - offset_days)
FROM generate_series(0, 89) AS offset_days
WHERE ((offset_days * 7 + 3) % 11) + (CASE WHEN offset_days < 21 THEN 1 ELSE 0 END) < 5
ON CONFLICT (subscription_id, used_date) DO NOTHING;
