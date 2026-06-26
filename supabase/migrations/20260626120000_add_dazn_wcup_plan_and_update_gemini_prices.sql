-- ============================================================================
-- プリセットプラン更新
--   DAZN: W杯用プラン（月額 ¥1,980）を追加
--   Gemini: Google AI Plus / Pro / Ultra の料金を最新公式価格へ更新
-- 設計書: docs/DATABASE_DESIGN.md / 出典: 各サービス公式（2026-06）
-- ============================================================================

-- DAZN W杯（月額更新）
INSERT INTO plans (id, service_id, name, price, currency, cycle_id)
VALUES (
  'b2000001-0001-4001-8001-000000000303',
  'b1000001-0001-4001-8001-000000000007',
  'DAZN W杯（月額更新）',
  1980,
  'JPY',
  (SELECT id FROM cycles WHERE name = 'monthly')
)
ON CONFLICT (id) DO UPDATE SET
  service_id = EXCLUDED.service_id,
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  cycle_id = EXCLUDED.cycle_id;

-- Gemini 有料プラン料金更新
UPDATE plans
SET price = 725
WHERE id = 'b2000001-0001-4001-8001-000000000058'
  AND service_id = 'b1000001-0001-4001-8001-000000000015';

UPDATE plans
SET price = 2900
WHERE id = 'b2000001-0001-4001-8001-000000000059'
  AND service_id = 'b1000001-0001-4001-8001-000000000015';

UPDATE plans
SET price = 14500
WHERE id = 'b2000001-0001-4001-8001-000000000060'
  AND service_id = 'b1000001-0001-4001-8001-000000000015';
