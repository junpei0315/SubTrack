-- ============================================================================
-- LINE 連携用テーブルとコード発行 RPC
-- 目的: LINE 公式アカウントのトーク上のボタンから、アプリを開かずに
--       利用実績（usage_logs）を記録できるようにする（F-08 の別チャネル）。
--
-- 構成:
--   - line_links       : SubTrack ユーザー(user_id) と LINE userId の紐付け
--   - line_link_codes  : 連携用ワンタイムコード（アプリ発行 → LINE で照合）
--   - create_line_link_code() : 認証ユーザー用にコードを発行する RPC
--
-- 書き込み（連携確定・利用記録）は Edge Function が service_role で行う。
-- そのため本テーブルへの直接の INSERT/UPDATE は一般ユーザーに許可しない。
-- ============================================================================

-- ============================================================================
-- 1. line_links: ユーザーと LINE userId の 1:1 紐付け
-- ============================================================================

CREATE TABLE LINE_LINKS (
    user_id UUID PRIMARY KEY REFERENCES PROFILES(id) ON DELETE CASCADE,
    line_user_id TEXT NOT NULL UNIQUE,
    linked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ============================================================================
-- 2. line_link_codes: 連携用ワンタイムコード（短命）
-- ============================================================================

CREATE TABLE LINE_LINK_CODES (
    code TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES PROFILES(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_line_link_codes_user_id ON LINE_LINK_CODES(user_id);

-- ============================================================================
-- 3. RLS
--   - line_links: 自分の連携状態は参照・解除(削除)できる。作成は service_role のみ。
--   - line_link_codes: 一般ユーザーからは直接アクセスさせない（RPC 経由で発行）。
-- ============================================================================

ALTER TABLE LINE_LINKS ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own line link" ON LINE_LINKS
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own line link" ON LINE_LINKS
    FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE LINE_LINK_CODES ENABLE ROW LEVEL SECURITY;
-- ポリシーを定義しない = 一般ユーザーは行を読めない/書けない。
-- service_role（Edge Function）は RLS をバイパスして照合・削除する。

-- ============================================================================
-- 4. コード発行 RPC（SECURITY DEFINER）
--   認証ユーザー自身に対して 6 桁コードを 1 件発行する（既存は置き換え）。
--   有効期限は 10 分。LINE のトークでこのコードを送ると連携が確定する。
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_line_link_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user UUID := auth.uid();
    v_code TEXT;
BEGIN
    IF v_user IS NULL THEN
        RAISE EXCEPTION 'not authenticated';
    END IF;

    -- 1 ユーザー 1 コード: 既存の未使用コードは破棄する
    DELETE FROM line_link_codes WHERE user_id = v_user;

    LOOP
        v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
        BEGIN
            INSERT INTO line_link_codes(code, user_id, expires_at)
            VALUES (v_code, v_user, now() + interval '10 minutes');
            RETURN v_code;
        EXCEPTION WHEN unique_violation THEN
            -- code 衝突時は別コードで再試行
        END;
    END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.create_line_link_code() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_line_link_code() TO authenticated;
