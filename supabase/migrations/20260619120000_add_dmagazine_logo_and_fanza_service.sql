-- dマガジン: logo_key を設定
UPDATE services
SET logo_key = 'dmagazine',
    logo_uri = NULL
WHERE id = 'b1000001-0001-4001-8001-000000000034';

-- FANZA: プリセットサービス・プラン追加（2026-06 時点の税込月額）
INSERT INTO services (id, name, category_id, logo_key, logo_uri, icon_name)
VALUES (
  'b1000001-0001-4001-8001-000000000054',
  'FANZA',
  2,
  'fanza',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  logo_key = EXCLUDED.logo_key,
  logo_uri = EXCLUDED.logo_uri,
  icon_name = EXCLUDED.icon_name;

INSERT INTO plans (id, service_id, name, price, currency, cycle_id)
VALUES
  (
    'b2000001-0001-4001-8001-000000000211',
    'b1000001-0001-4001-8001-000000000054',
    'FANZA TV（DMMプレミアム）',
    550,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000212',
    'b1000001-0001-4001-8001-000000000054',
    'FANZA TV Plus',
    1628,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000213',
    'b1000001-0001-4001-8001-000000000054',
    '見放題ch',
    3980,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000214',
    'b1000001-0001-4001-8001-000000000054',
    '見放題chデラックス',
    8980,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000215',
    'b1000001-0001-4001-8001-000000000054',
    'VR ch',
    2800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  )
ON CONFLICT (id) DO UPDATE SET
  service_id = EXCLUDED.service_id,
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  cycle_id = EXCLUDED.cycle_id;
