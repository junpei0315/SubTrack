-- ============================================================================
-- プリセットプラン追加
--   AppleCare+「iPhone（月払い）」¥1,180
--     既存 AppleCare+ は年額の端末別プランのみで月払いが無かったため追加。
--     （AppleCare+ は端末により料金が異なる。ここでは iPhone の月払いを追加）
-- 設計書: docs/DATABASE_DESIGN.md / 出典: 各サービス公式
-- ============================================================================

INSERT INTO plans (id, service_id, name, price, currency, cycle_id) VALUES
  ('b2000001-0001-4001-8001-000000000302', 'b1000001-0001-4001-8001-000000000028', 'iPhone（月払い）', 1180.00, 'JPY', 1)
ON CONFLICT (id) DO UPDATE SET
  service_id = EXCLUDED.service_id,
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  cycle_id = EXCLUDED.cycle_id;
