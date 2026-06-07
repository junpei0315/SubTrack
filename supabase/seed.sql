-- ============================================================================
-- SubTrack ローカル開発用シードデータ
-- 適用タイミング: `supabase db reset` のみ（リモートには自動適用されない）
--
-- マスタ（categories / cycles / services / plans）は migration で投入済み。
-- 本ファイルは開発用ユーザーとサンプル契約のみ。
--
-- テストユーザー:
--   Email   : dev@subtrack.local
--   Password: password123
--
-- 請求情報コンポーネント確認用 URL（Expo Web 例）:
--   /subscriptions/22222222-2222-2222-2222-222222222001  Netflix（毎月）
--   /subscriptions/22222222-2222-2222-2222-222222222002  Spotify（毎月）
--   /subscriptions/22222222-2222-2222-2222-222222222003  Canva Pro（毎月）
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
-- 2. サンプル契約（プリセット plans を参照）
--    plan_id は migration 20260606120100_seed_preset_services_plans.sql の UUID
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
        'b2000001-0001-4001-8001-000000000003',
        '2021-09-24',
        (date_trunc('month', CURRENT_DATE) + interval '4 days')::date,
        'active'
    ),
    (
        '22222222-2222-2222-2222-222222222002',
        '11111111-1111-1111-1111-111111111111',
        'b2000001-0001-4001-8001-000000000004',
        '2022-03-01',
        (date_trunc('month', CURRENT_DATE) + interval '11 days')::date,
        'active'
    ),
    (
        '22222222-2222-2222-2222-222222222003',
        '11111111-1111-1111-1111-111111111111',
        'b2000001-0001-4001-8001-000000000089',
        '2020-06-15',
        (date_trunc('month', CURRENT_DATE) + interval '19 days')::date,
        'active'
    ),
    (
        '22222222-2222-2222-2222-222222222004',
        '11111111-1111-1111-1111-111111111111',
        'b2000001-0001-4001-8001-000000000051',
        '2023-11-01',
        (date_trunc('month', CURRENT_DATE) + interval '24 days')::date,
        'active'
    )
ON CONFLICT (id) DO NOTHING;
