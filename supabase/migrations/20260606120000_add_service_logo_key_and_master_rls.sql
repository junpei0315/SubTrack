-- ============================================================================
-- プリセットサービス用 logo_key 追加 + マスタテーブル RLS
-- ----------------------------------------------------------------------------
-- logo_key: assets/services/{logo_key}.jpeg の同梱ロゴと紐づける安定識別子
-- マスタ（categories / cycles / services / plans）は全ユーザーが SELECT 可能
-- 設計書: docs/DATABASE_DESIGN.md
-- ============================================================================

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS logo_key VARCHAR(100);

CREATE UNIQUE INDEX IF NOT EXISTS services_logo_key_key
  ON services (logo_key)
  WHERE logo_key IS NOT NULL;

COMMENT ON COLUMN services.logo_key IS
  '同梱ロゴ assets/services/{logo_key}.jpeg を指す識別子。logo_uri より優先してアプリ側で解決する。';

-- categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- cycles
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read cycles" ON cycles;
CREATE POLICY "Anyone can read cycles"
  ON cycles
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read services" ON services;
CREATE POLICY "Anyone can read services"
  ON services
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read plans" ON plans;
CREATE POLICY "Anyone can read plans"
  ON plans
  FOR SELECT
  TO anon, authenticated
  USING (true);
