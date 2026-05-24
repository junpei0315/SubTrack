-- ============================================================================
-- SubTrack マイグレーション SQL
-- Supabase (PostgreSQL) ローカル環境向け
-- 作成日: 2026-05-24
-- 
-- このスクリプトは、ER図と仕様に基づいた初期スキーマを作成します。
-- テーブルは依存関係に従って親から順に作成されます。
-- ============================================================================

-- ============================================================================
-- 1. 親マスタテーブル（依存関係なし）
-- ============================================================================

-- CYCLES テーブル：サブスク周期の管理（月額、年額など）
CREATE TABLE CYCLES (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

-- CATEGORIES テーブル：サービスのジャンル分類
CREATE TABLE CATEGORIES (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    color_code VARCHAR(7) NOT NULL
);

-- ============================================================================
-- 2. PROFILES テーブル：ユーザー認証と基本情報
-- ============================================================================
-- Supabase認証システム（auth.users）と連携
-- on delete cascade により、ユーザー削除時に自動で関連レコードが削除される

CREATE TABLE PROFILES (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    display_currency VARCHAR(3) DEFAULT 'JPY' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 3. SERVICES テーブル：提供されるサービス（アプリ、SaaS等）
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
    name VARCHAR(255),
    price NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(3),
    cycle_id INTEGER REFERENCES CYCLES(id) ON DELETE SET NULL
);

-- ============================================================================
-- 5. SUBSCRIPTIONS テーブル：ユーザーのサブスク契約
-- ============================================================================

CREATE TABLE SUBSCRIPTIONS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES PROFILES(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES PLANS(id) ON DELETE RESTRICT,
    next_billing_date DATE NOT NULL,
    status VARCHAR(50),
    memo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 6. NOTIFICATION_SETTINGS テーブル：通知設定
-- ============================================================================

CREATE TABLE NOTIFICATION_SETTINGS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES SUBSCRIPTIONS(id) ON DELETE CASCADE,
    notify_days_before INTEGER
);

-- ============================================================================
-- 7. USAGE_LOGS テーブル：ユーザーの利用ログ
-- ============================================================================

CREATE TABLE USAGE_LOGS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES PROFILES(id) ON DELETE CASCADE,
    subscription_id UUID NOT NULL REFERENCES SUBSCRIPTIONS(id) ON DELETE CASCADE,
    used_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- インデックス定義（クエリパフォーマンス向上）
-- ============================================================================

-- SUBSCRIPTIONS テーブルのインデックス
CREATE INDEX idx_subscriptions_user_id ON SUBSCRIPTIONS(user_id);
CREATE INDEX idx_subscriptions_plan_id ON SUBSCRIPTIONS(plan_id);
CREATE INDEX idx_subscriptions_next_billing_date ON SUBSCRIPTIONS(next_billing_date);

-- NOTIFICATION_SETTINGS テーブルのインデックス
CREATE INDEX idx_notification_settings_subscription_id ON NOTIFICATION_SETTINGS(subscription_id);

-- USAGE_LOGS テーブルのインデックス
CREATE INDEX idx_usage_logs_user_id ON USAGE_LOGS(user_id);
CREATE INDEX idx_usage_logs_subscription_id ON USAGE_LOGS(subscription_id);
CREATE INDEX idx_usage_logs_used_date ON USAGE_LOGS(used_date);

-- SERVICES テーブルのインデックス
CREATE INDEX idx_services_category_id ON SERVICES(category_id);

-- PLANS テーブルのインデックス
CREATE INDEX idx_plans_service_id ON PLANS(service_id);
CREATE INDEX idx_plans_cycle_id ON PLANS(cycle_id);

-- ============================================================================
-- Row Level Security (RLS) ポリシー（認証関連）
-- ============================================================================
-- ユーザーは自分のプロフィール・サブスク情報のみアクセス可能

ALTER TABLE PROFILES ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON PROFILES
    FOR SELECT USING (auth.uid() = id);

ALTER TABLE SUBSCRIPTIONS ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subscriptions" ON SUBSCRIPTIONS
    FOR SELECT USING (auth.uid() = user_id);

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
CREATE POLICY "Users can view their own usage logs" ON USAGE_LOGS
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- マイグレーション完了
-- ============================================================================