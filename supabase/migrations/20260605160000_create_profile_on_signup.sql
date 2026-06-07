-- ============================================================================
-- 新規ユーザー登録時に profiles 行を自動作成する
-- ----------------------------------------------------------------------------
-- 背景:
--   Supabase Auth (auth.users) にユーザーが作成されても、アプリ用の
--   public.profiles 行は自動では作られない。subscriptions / usage_logs は
--   profiles.id を参照するため、サインアップ直後に profiles を用意する必要がある。
--   メール認証・Google OAuth いずれの経路でも auth.users への INSERT を契機に
--   トリガで profiles を作成する。
-- 設計書: docs/DATABASE_DESIGN.md（PROFILES）
-- ============================================================================

-- auth スキーマのトリガから public.profiles へ INSERT するため SECURITY DEFINER で実行する。
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
