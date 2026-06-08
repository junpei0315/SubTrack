-- ============================================================================
-- 既存 auth.users に profiles が無いユーザーの backfill
-- + create_line_link_code 実行時に profile を自動作成（防御）
--
-- 背景: handle_new_user トリガ導入前に登録したユーザーは profiles 行が無く、
--       line_link_codes への INSERT が FK 制約で失敗する。
-- ============================================================================

-- 1. 既存ユーザーの backfill
INSERT INTO profiles (id, email)
SELECT u.id, coalesce(u.email, '')
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 2. RPC を更新: コード発行前に profile が無ければ作成する
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

    -- profiles 行が無い場合は auth.users から作成（トリガ導入前登録ユーザーの救済）
    INSERT INTO profiles (id, email)
    SELECT u.id, coalesce(u.email, '')
    FROM auth.users u
    WHERE u.id = v_user
    ON CONFLICT (id) DO NOTHING;

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
