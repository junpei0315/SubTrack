-- マスタテーブル（categories / cycles / services / plans）の参照ポリシー
-- 本番では RLS が有効だが SELECT ポリシーが無く、subscriptions の embed が null になる問題を解消する。

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can read cycles" ON cycles FOR SELECT USING (true);
CREATE POLICY "Anyone can read services" ON services FOR SELECT USING (true);
CREATE POLICY "Anyone can read plans" ON plans FOR SELECT USING (true);
