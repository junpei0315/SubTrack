-- ============================================================================
-- SubTrack マイグレーション SQL
-- Supabase (PostgreSQL) ローカル環境向け
-- ============================================================================

-- ============================================================================
-- 1. 親マスタテーブル
-- ============================================================================

-- CYCLES テーブル：サブスク周期の管理
CREATE TABLE CYCLES (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- CATEGORIES テーブル：サービスのジャンル分類
CREATE TABLE CATEGORIES (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(7) NOT NULL,
    icon_name VARCHAR(100)
);

-- ============================================================================
-- 2. PROFILES テーブル：ユーザー認証と基本情報
-- ============================================================================

CREATE TABLE PROFILES (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    display_currency VARCHAR(8) DEFAULT 'JPY' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 3. SERVICES テーブル：提供されるサービス
-- ============================================================================

CREATE TABLE SERVICES (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category_id INTEGER NOT NULL REFERENCES CATEGORIES(id) ON DELETE RESTRICT,
    logo_uri VARCHAR(500),
    icon_name VARCHAR(100)
);

-- ============================================================================
-- 4. PLANS テーブル：各サービスのプラン
-- ============================================================================

CREATE TABLE PLANS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES SERVICES(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'JPY' NOT NULL,
    cycle_id INTEGER NOT NULL REFERENCES CYCLES(id) ON DELETE RESTRICT
);

-- ============================================================================
-- 5. SUBSCRIPTIONS テーブル：ユーザーのサブスク契約
-- ============================================================================

CREATE TABLE SUBSCRIPTIONS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES PROFILES(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES PLANS(id) ON DELETE RESTRICT,
    next_billing_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- 6. NOTIFICATION_SETTINGS テーブル：通知設定
-- ============================================================================

CREATE TABLE NOTIFICATION_SETTINGS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES SUBSCRIPTIONS(id) ON DELETE CASCADE,
    notify_days_before INTEGER NOT NULL
);

-- ============================================================================
-- 7. USAGE_LOGS テーブル：ユーザーの利用ログ
-- ============================================================================

CREATE TABLE USAGE_LOGS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES PROFILES(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES SUBSCRIPTIONS(id) ON DELETE CASCADE,
    used_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    CONSTRAINT unique_subscription_use UNIQUE(subscription_id, used_date)
);

-- ============================================================================
-- インデックス定義
-- ============================================================================

CREATE INDEX idx_subscriptions_user_id ON SUBSCRIPTIONS(user_id);
CREATE INDEX idx_subscriptions_plan_id ON SUBSCRIPTIONS(plan_id);
CREATE INDEX idx_subscriptions_next_billing_date ON SUBSCRIPTIONS(next_billing_date);
CREATE INDEX idx_notification_settings_subscription_id ON NOTIFICATION_SETTINGS(subscription_id);
CREATE INDEX idx_usage_logs_user_id ON USAGE_LOGS(user_id);
CREATE INDEX idx_usage_logs_subscription_id ON USAGE_LOGS(subscription_id);
CREATE INDEX idx_usage_logs_used_date ON USAGE_LOGS(used_date);
CREATE INDEX idx_services_category_id ON SERVICES(category_id);
CREATE INDEX idx_plans_service_id ON PLANS(service_id);
CREATE INDEX idx_plans_cycle_id ON PLANS(cycle_id);

-- ============================================================================
-- Row Level Security (RLS) ポリシー
-- ============================================================================

ALTER TABLE PROFILES ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON PROFILES FOR SELECT USING (auth.uid() = id);

ALTER TABLE SUBSCRIPTIONS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions" ON SUBSCRIPTIONS FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE NOTIFICATION_SETTINGS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage notifications for their subscriptions" ON NOTIFICATION_SETTINGS
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM SUBSCRIPTIONS
            WHERE SUBSCRIPTIONS.id = NOTIFICATION_SETTINGS.subscription_id
            AND SUBSCRIPTIONS.user_id = auth.uid()
        )
    );

ALTER TABLE USAGE_LOGS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own usage logs" ON USAGE_LOGS FOR SELECT USING (auth.uid() = user_id);