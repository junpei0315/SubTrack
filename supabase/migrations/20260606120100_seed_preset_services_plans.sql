-- ============================================================================
-- プリセットサブスクマスタ（cycles / categories / services / plans）
-- ----------------------------------------------------------------------------
-- 出典: Notion「主要サブスク一覧」を正とする（各値は要レビュー）。
-- cycle は monthly / yearly / weekly のみ。3ヶ月・期間保証などはプラン名に
-- 期間を併記し、近い cycle に丸めている。
-- logo_key は assets/services/{logo_key}.jpeg と対応（無い場合は NULL）。
-- このファイルは scripts/generate-preset-seed.js から自動生成。
-- 設計書: docs/DATABASE_DESIGN.md
-- ============================================================================

INSERT INTO cycles (name) VALUES
  ('monthly'),
  ('yearly'),
  ('weekly')
ON CONFLICT (name) DO NOTHING;

INSERT INTO categories (id, name, color_code, icon_name) VALUES
  (1, 'AI', '#10a37f', 'sparkles'),
  (2, '動画配信', '#ff3a5e', 'play-circle'),
  (3, '音楽', '#1db954', 'music'),
  (4, 'ゲーム', '#5865f2', 'gamepad-2'),
  (5, 'フィットネス', '#ff6b35', 'dumbbell'),
  (6, '電子書籍', '#f4a261', 'book-open'),
  (7, 'マッチングアプリ', '#e91e63', 'heart'),
  (8, 'ストレージ', '#4285f4', 'hard-drive'),
  (9, '学習', '#7c3aed', 'graduation-cap'),
  (10, 'SNS', '#1da1f2', 'share-2'),
  (11, 'ビジネス', '#6366f1', 'briefcase'),
  (12, '飲食', '#ef4444', 'utensils'),
  (13, 'モビリティ', '#000000', 'car'),
  (14, 'デザイン', '#ff0000', 'palette'),
  (15, '開発', '#333333', 'code'),
  (16, 'ユーティリティ', '#64748b', 'wrench'),
  (17, 'その他', '#9aa0a6', 'more-horizontal')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color_code = EXCLUDED.color_code,
  icon_name = EXCLUDED.icon_name;

SELECT setval(
  pg_get_serial_sequence('categories', 'id'),
  (SELECT COALESCE(MAX(id), 1) FROM categories)
);

INSERT INTO services (id, name, category_id, logo_key, logo_uri, icon_name) VALUES
  ('b1000001-0001-4001-8001-000000000001', 'Netflix', 2, 'netflix', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000002', 'Spotify', 3, 'spotify', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000003', 'Hulu', 2, 'hulu', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000004', 'Amazon Prime Video', 2, 'amazonprime', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000005', 'U-NEXT', 2, 'unext', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000006', 'Disney+', 2, 'disneyplus', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000007', 'DAZN', 2, 'dazn', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000008', 'ABEMA', 2, 'abema', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000009', 'YouTube Premium', 2, 'youtube', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000010', 'YouTube Music', 3, 'youtubemusic', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000011', 'Apple Music', 3, 'applemusic', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000012', 'LINE MUSIC', 3, NULL, 'https://upload.wikimedia.org/wikipedia/commons/3/33/LINEMUSIC.png', NULL),
  ('b1000001-0001-4001-8001-000000000013', 'ChatGPT', 1, 'chatgpt', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000014', 'Claude', 1, 'claude', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000015', 'Gemini', 1, NULL, 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Google_Gemini_icon_2025.svg/3840px-Google_Gemini_icon_2025.svg.png', NULL),
  ('b1000001-0001-4001-8001-000000000016', 'Cursor', 1, 'cursor', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000017', 'GitHub', 15, 'github', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000018', 'Notion', 11, 'notion', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000019', 'Slack', 11, 'slack', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000020', 'Figma', 14, NULL, 'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg', NULL),
  ('b1000001-0001-4001-8001-000000000021', 'Canva', 14, 'canva', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000022', 'DeepL', 1, 'deepl', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000023', 'Dropbox', 8, 'dropbox', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000024', 'Google One', 8, 'googleone', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000025', 'iCloud+', 8, 'icloud', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000026', 'GoodNotes', 11, 'goodnotes', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000027', 'Apple One', 17, 'apple', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000028', 'AppleCare+', 17, NULL, 'https://www.apple.com/legal/images/icon_applecare_plus_rnd/icon_applecare_plus_rnd_large_2x.png', NULL),
  ('b1000001-0001-4001-8001-000000000029', 'Simeji', 16, 'simeji', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000030', 'Nintendo Switch Online', 4, 'nintendo', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000031', 'PlayStation Plus', 4, 'playstation', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000032', 'Kindle Unlimited', 6, 'kindle', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000033', 'Audible', 6, 'audible', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000034', 'dマガジン', 6, NULL, NULL, NULL),
  ('b1000001-0001-4001-8001-000000000035', 'コミックシーモア', 6, NULL, NULL, NULL),
  ('b1000001-0001-4001-8001-000000000036', 'pixivプレミアム', 14, 'pixiv', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000037', 'X', 10, 'x', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000038', 'Pairs', 7, 'pairs', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000039', 'with', 7, 'with', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000040', 'タップル', 7, 'tapple', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000041', 'Tinder', 7, 'tinder', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000042', 'Duolingo', 9, 'duolingo', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000043', 'Progate', 9, 'progate', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000044', 'Udemy', 9, 'udemy', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000045', 'エニタイムフィットネス', 5, 'anytimefitness.co', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000046', 'chocoZAP', 5, 'chocozap', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000047', 'nosh', 12, 'nosh', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000048', 'すき家', 12, 'sukiya', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000049', 'Coke ON', 16, 'cocacola', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000050', 'LUUP', 13, 'luup', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000051', 'Uber One', 12, 'uber', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000052', 'GO', 13, 'goinc', NULL, NULL),
  ('b1000001-0001-4001-8001-000000000053', 'ChargeSPOT', 16, 'chargespot', NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category_id = EXCLUDED.category_id,
  logo_key = EXCLUDED.logo_key,
  logo_uri = EXCLUDED.logo_uri;

INSERT INTO plans (id, service_id, name, price, currency, cycle_id) VALUES
  (
    'b2000001-0001-4001-8001-000000000001',
    'b1000001-0001-4001-8001-000000000001',
    '広告つきスタンダード',
    890,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000002',
    'b1000001-0001-4001-8001-000000000001',
    'スタンダード',
    1590,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000003',
    'b1000001-0001-4001-8001-000000000001',
    'プレミアム',
    2290,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000004',
    'b1000001-0001-4001-8001-000000000002',
    'Standard',
    1080,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000005',
    'b1000001-0001-4001-8001-000000000002',
    'Student',
    580,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000006',
    'b1000001-0001-4001-8001-000000000002',
    'Duo',
    1480,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000007',
    'b1000001-0001-4001-8001-000000000002',
    'Family',
    1880,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000008',
    'b1000001-0001-4001-8001-000000000003',
    '月額',
    1026,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000009',
    'b1000001-0001-4001-8001-000000000004',
    'プライム（月間）',
    600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000010',
    'b1000001-0001-4001-8001-000000000004',
    'プライム（年間）',
    5900,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000011',
    'b1000001-0001-4001-8001-000000000004',
    'Prime Student（月間）',
    300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000012',
    'b1000001-0001-4001-8001-000000000004',
    'Prime Student（年間）',
    2950,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000013',
    'b1000001-0001-4001-8001-000000000005',
    '月額利用料',
    2189,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000014',
    'b1000001-0001-4001-8001-000000000006',
    'スタンダード（月額）',
    1250,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000015',
    'b1000001-0001-4001-8001-000000000006',
    'プレミアム（月額）',
    1670,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000016',
    'b1000001-0001-4001-8001-000000000006',
    'スタンダード（年額）',
    12500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000017',
    'b1000001-0001-4001-8001-000000000006',
    'プレミアム（年額）',
    16700,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000018',
    'b1000001-0001-4001-8001-000000000007',
    'DAZNスタンダード（月額更新）',
    4200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000019',
    'b1000001-0001-4001-8001-000000000007',
    'DAZNスタンダード（年額前払い）',
    32000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000020',
    'b1000001-0001-4001-8001-000000000007',
    'DAZNスタンダード（年額分割払い）',
    3200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000021',
    'b1000001-0001-4001-8001-000000000007',
    'DAZNサッカー（年額分割払い）',
    2600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000022',
    'b1000001-0001-4001-8001-000000000007',
    'DAZNグローバル（月額更新）',
    980,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000023',
    'b1000001-0001-4001-8001-000000000007',
    'DAZNベースボール（年額前払い）',
    27600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000024',
    'b1000001-0001-4001-8001-000000000007',
    'DAZNベースボール（年額分割払い）',
    2300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000025',
    'b1000001-0001-4001-8001-000000000007',
    'ABEMA de DAZN学割（月額更新）',
    1600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000026',
    'b1000001-0001-4001-8001-000000000007',
    'ABEMA de DAZN学割（年額前払い）',
    16000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000027',
    'b1000001-0001-4001-8001-000000000008',
    '広告つきABEMAプレミアム',
    680,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000028',
    'b1000001-0001-4001-8001-000000000008',
    'ABEMAプレミアム',
    1180,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000029',
    'b1000001-0001-4001-8001-000000000008',
    '広告つきABEMAプレミアム｜Disney+スタンダード',
    1640,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000030',
    'b1000001-0001-4001-8001-000000000008',
    'ABEMAプレミアム｜Disney+スタンダード',
    1860,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000031',
    'b1000001-0001-4001-8001-000000000008',
    '広告つきABEMAプレミアム｜Disney+プレミアム',
    2000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000032',
    'b1000001-0001-4001-8001-000000000008',
    'ABEMAプレミアム｜Disney+プレミアム',
    2190,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000033',
    'b1000001-0001-4001-8001-000000000009',
    '個人',
    1280,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000034',
    'b1000001-0001-4001-8001-000000000009',
    'ファミリー',
    2280,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000035',
    'b1000001-0001-4001-8001-000000000009',
    '学生',
    780,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000036',
    'b1000001-0001-4001-8001-000000000009',
    'Premium Lite',
    780,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000037',
    'b1000001-0001-4001-8001-000000000010',
    '個人（月額）',
    1080,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000038',
    'b1000001-0001-4001-8001-000000000010',
    '個人（年額）',
    10800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000039',
    'b1000001-0001-4001-8001-000000000010',
    'ファミリー',
    1680,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000040',
    'b1000001-0001-4001-8001-000000000010',
    '学生',
    580,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000041',
    'b1000001-0001-4001-8001-000000000011',
    '個人',
    1080,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000042',
    'b1000001-0001-4001-8001-000000000011',
    'ファミリー',
    1680,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000043',
    'b1000001-0001-4001-8001-000000000011',
    '学生',
    580,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000044',
    'b1000001-0001-4001-8001-000000000012',
    '一般',
    1080,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000045',
    'b1000001-0001-4001-8001-000000000012',
    '一般（LINE STORE限定）',
    980,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000046',
    'b1000001-0001-4001-8001-000000000012',
    '学生',
    580,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000047',
    'b1000001-0001-4001-8001-000000000012',
    '学生（LINE STORE限定）',
    480,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000048',
    'b1000001-0001-4001-8001-000000000012',
    'ファミリー',
    1680,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000049',
    'b1000001-0001-4001-8001-000000000013',
    '無料版',
    0,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000050',
    'b1000001-0001-4001-8001-000000000013',
    'Go',
    1400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000051',
    'b1000001-0001-4001-8001-000000000013',
    'Plus',
    3000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000052',
    'b1000001-0001-4001-8001-000000000013',
    'Pro',
    16800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000053',
    'b1000001-0001-4001-8001-000000000013',
    'ビジネス',
    3050,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000054',
    'b1000001-0001-4001-8001-000000000014',
    '無料',
    0,
    'USD',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000055',
    'b1000001-0001-4001-8001-000000000014',
    'Pro',
    20,
    'USD',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000056',
    'b1000001-0001-4001-8001-000000000014',
    'Max',
    100,
    'USD',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000057',
    'b1000001-0001-4001-8001-000000000015',
    '無料',
    0,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000058',
    'b1000001-0001-4001-8001-000000000015',
    'Google AI Plus',
    1200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000059',
    'b1000001-0001-4001-8001-000000000015',
    'Google AI Pro',
    2900,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000060',
    'b1000001-0001-4001-8001-000000000015',
    'Google AI Ultra',
    14500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000061',
    'b1000001-0001-4001-8001-000000000016',
    'Hobby（月払い）',
    0,
    'USD',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000062',
    'b1000001-0001-4001-8001-000000000016',
    '個人（月払い）',
    20,
    'USD',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000063',
    'b1000001-0001-4001-8001-000000000016',
    'Teams（月払い）',
    40,
    'USD',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000064',
    'b1000001-0001-4001-8001-000000000016',
    'Hobby（年払い）',
    0,
    'USD',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000065',
    'b1000001-0001-4001-8001-000000000016',
    '個人（年払い・月あたり）',
    16,
    'USD',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000066',
    'b1000001-0001-4001-8001-000000000016',
    'Teams（年払い・月あたり）',
    32,
    'USD',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000067',
    'b1000001-0001-4001-8001-000000000017',
    'Team（月払い）',
    4,
    'USD',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000068',
    'b1000001-0001-4001-8001-000000000017',
    'Enterprise（月払い）',
    21,
    'USD',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000069',
    'b1000001-0001-4001-8001-000000000017',
    'Team（年払い）',
    48,
    'USD',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000070',
    'b1000001-0001-4001-8001-000000000017',
    'Enterprise（年払い）',
    252,
    'USD',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000071',
    'b1000001-0001-4001-8001-000000000018',
    'プラス（月払い）',
    2000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000072',
    'b1000001-0001-4001-8001-000000000018',
    'ビジネス（月払い）',
    3800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000073',
    'b1000001-0001-4001-8001-000000000018',
    'プラス（年払い・月あたり）',
    1650,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000074',
    'b1000001-0001-4001-8001-000000000018',
    'ビジネス（年払い・月あたり）',
    3150,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000075',
    'b1000001-0001-4001-8001-000000000019',
    'プロ（年払い・月あたり）',
    925,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000076',
    'b1000001-0001-4001-8001-000000000019',
    'プロ（月払い）',
    1920,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000077',
    'b1000001-0001-4001-8001-000000000020',
    'プロフェッショナル フルシート（月払い）',
    3000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000078',
    'b1000001-0001-4001-8001-000000000020',
    'プロフェッショナル Devシート（月払い）',
    2250,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000079',
    'b1000001-0001-4001-8001-000000000020',
    'プロフェッショナル コラボシート（月払い）',
    750,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000080',
    'b1000001-0001-4001-8001-000000000020',
    'プロフェッショナル フルシート（年払い・月あたり）',
    2400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000081',
    'b1000001-0001-4001-8001-000000000020',
    'プロフェッショナル Devシート（年払い・月あたり）',
    1800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000082',
    'b1000001-0001-4001-8001-000000000020',
    'プロフェッショナル コラボシート（年払い・月あたり）',
    450,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000083',
    'b1000001-0001-4001-8001-000000000020',
    'ビジネス フルシート',
    8300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000084',
    'b1000001-0001-4001-8001-000000000020',
    'ビジネス Devシート',
    3750,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000085',
    'b1000001-0001-4001-8001-000000000020',
    'ビジネス コラボシート',
    750,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000086',
    'b1000001-0001-4001-8001-000000000020',
    'エンタープライズ フルシート',
    13600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000087',
    'b1000001-0001-4001-8001-000000000020',
    'エンタープライズ Devシート',
    5250,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000088',
    'b1000001-0001-4001-8001-000000000020',
    'エンタープライズ コラボシート',
    750,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000089',
    'b1000001-0001-4001-8001-000000000021',
    'プロ',
    8300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000090',
    'b1000001-0001-4001-8001-000000000021',
    'ビジネス',
    18800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000091',
    'b1000001-0001-4001-8001-000000000022',
    'Individual（月払い）',
    1380,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000092',
    'b1000001-0001-4001-8001-000000000022',
    'Team（月払い）',
    4500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000093',
    'b1000001-0001-4001-8001-000000000022',
    'Business（月払い）',
    9000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000094',
    'b1000001-0001-4001-8001-000000000022',
    'Individual（年払い・月あたり）',
    1150,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000095',
    'b1000001-0001-4001-8001-000000000022',
    'Team（年払い・月あたり）',
    3750,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000096',
    'b1000001-0001-4001-8001-000000000022',
    'Business（年払い・月あたり）',
    7500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000097',
    'b1000001-0001-4001-8001-000000000023',
    'Plus（月払い）',
    1500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000098',
    'b1000001-0001-4001-8001-000000000023',
    'Professional（月払い）',
    2400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000099',
    'b1000001-0001-4001-8001-000000000023',
    'Standard（月払い）',
    1800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000100',
    'b1000001-0001-4001-8001-000000000023',
    'Advanced（月払い）',
    2800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000101',
    'b1000001-0001-4001-8001-000000000023',
    'Plus（年払い・月あたり）',
    1200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000102',
    'b1000001-0001-4001-8001-000000000023',
    'Professional（年払い・月あたり）',
    2000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000103',
    'b1000001-0001-4001-8001-000000000023',
    'Standard（年払い・月あたり）',
    1500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000104',
    'b1000001-0001-4001-8001-000000000023',
    'Advanced（年払い・月あたり）',
    2400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000105',
    'b1000001-0001-4001-8001-000000000024',
    'Basic（月払い）',
    290,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000106',
    'b1000001-0001-4001-8001-000000000024',
    'Google AI Plus 200GB（月払い）',
    1200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000107',
    'b1000001-0001-4001-8001-000000000024',
    'Google AI Plus 2TB（月払い）',
    1450,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000108',
    'b1000001-0001-4001-8001-000000000024',
    'Google AI Pro 5TB（月払い）',
    2900,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000109',
    'b1000001-0001-4001-8001-000000000024',
    'Basic（年払い）',
    2900,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000110',
    'b1000001-0001-4001-8001-000000000024',
    'Google AI Plus 200GB（年払い）',
    12000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000111',
    'b1000001-0001-4001-8001-000000000024',
    'Google AI Plus 2TB（年払い）',
    14500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000112',
    'b1000001-0001-4001-8001-000000000024',
    'Google AI Pro 5TB（年払い）',
    29000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000113',
    'b1000001-0001-4001-8001-000000000025',
    '50GB',
    150,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000114',
    'b1000001-0001-4001-8001-000000000025',
    '200GB',
    450,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000115',
    'b1000001-0001-4001-8001-000000000025',
    '2TB',
    1500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000116',
    'b1000001-0001-4001-8001-000000000026',
    '年額',
    1350,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000117',
    'b1000001-0001-4001-8001-000000000027',
    '個人',
    1200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000118',
    'b1000001-0001-4001-8001-000000000027',
    'ファミリー',
    1980,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000119',
    'b1000001-0001-4001-8001-000000000028',
    'iPhone（2年間）',
    19800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000120',
    'b1000001-0001-4001-8001-000000000028',
    'Mac（3年間）',
    15400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000121',
    'b1000001-0001-4001-8001-000000000028',
    'ディスプレイ（3年間）',
    23400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000122',
    'b1000001-0001-4001-8001-000000000028',
    'iPad（2年間）',
    10800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000123',
    'b1000001-0001-4001-8001-000000000028',
    'Watch（2年間）',
    7400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000124',
    'b1000001-0001-4001-8001-000000000028',
    'Vision（2年間）',
    68800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000125',
    'b1000001-0001-4001-8001-000000000028',
    'ヘッドフォン（2年間）',
    4600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000126',
    'b1000001-0001-4001-8001-000000000028',
    'TV（3年間）',
    4200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000127',
    'b1000001-0001-4001-8001-000000000028',
    'HomePod（2年間）',
    2200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000128',
    'b1000001-0001-4001-8001-000000000029',
    '月額プラン',
    400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000129',
    'b1000001-0001-4001-8001-000000000029',
    '年額プラン',
    2400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000130',
    'b1000001-0001-4001-8001-000000000030',
    '個人プラン（月額）',
    306,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000131',
    'b1000001-0001-4001-8001-000000000030',
    '個人プラン（3ヶ月）',
    815,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000132',
    'b1000001-0001-4001-8001-000000000030',
    '個人プラン（年額）',
    2400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000133',
    'b1000001-0001-4001-8001-000000000030',
    '個人プラン+追加パック（年額）',
    4900,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000134',
    'b1000001-0001-4001-8001-000000000030',
    'ファミリープラン（年額）',
    4500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000135',
    'b1000001-0001-4001-8001-000000000030',
    'ファミリープラン+追加パック（年額）',
    8900,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000136',
    'b1000001-0001-4001-8001-000000000031',
    'プレミアム（月額）',
    1550,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000137',
    'b1000001-0001-4001-8001-000000000031',
    'プレミアム（3ヶ月）',
    4300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000138',
    'b1000001-0001-4001-8001-000000000031',
    'プレミアム（年額）',
    13900,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000139',
    'b1000001-0001-4001-8001-000000000031',
    'エクストラ（月額）',
    1300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000140',
    'b1000001-0001-4001-8001-000000000031',
    'エクストラ（3ヶ月）',
    3600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000141',
    'b1000001-0001-4001-8001-000000000031',
    'エクストラ（年額）',
    11700,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000142',
    'b1000001-0001-4001-8001-000000000031',
    'エッセンシャル（月額）',
    850,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000143',
    'b1000001-0001-4001-8001-000000000031',
    'エッセンシャル（3ヶ月）',
    2150,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000144',
    'b1000001-0001-4001-8001-000000000031',
    'エッセンシャル（年額）',
    6800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000145',
    'b1000001-0001-4001-8001-000000000032',
    '月額',
    980,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000146',
    'b1000001-0001-4001-8001-000000000033',
    '月額',
    1500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000147',
    'b1000001-0001-4001-8001-000000000034',
    '月額',
    580,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000148',
    'b1000001-0001-4001-8001-000000000035',
    '読み放題フル',
    1480,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000149',
    'b1000001-0001-4001-8001-000000000036',
    'プレミアム',
    590,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000150',
    'b1000001-0001-4001-8001-000000000037',
    'ベーシック（月額）',
    368,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000151',
    'b1000001-0001-4001-8001-000000000037',
    'ベーシック（年額）',
    3916,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000152',
    'b1000001-0001-4001-8001-000000000037',
    'プレミアム（月額）',
    980,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000153',
    'b1000001-0001-4001-8001-000000000037',
    'プレミアム（年額）',
    10280,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000154',
    'b1000001-0001-4001-8001-000000000037',
    'プレミアムプラス（月額）',
    6080,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000155',
    'b1000001-0001-4001-8001-000000000037',
    'プレミアムプラス（年額）',
    60040,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000156',
    'b1000001-0001-4001-8001-000000000038',
    '男性有料会員（1カ月）',
    4100,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000157',
    'b1000001-0001-4001-8001-000000000038',
    '男性有料会員（3カ月）',
    9100,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000158',
    'b1000001-0001-4001-8001-000000000038',
    '男性有料会員（6カ月）',
    14200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000159',
    'b1000001-0001-4001-8001-000000000038',
    '男性有料会員（12カ月）',
    20100,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000160',
    'b1000001-0001-4001-8001-000000000039',
    '有料プラン（1カ月）',
    4160,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000161',
    'b1000001-0001-4001-8001-000000000039',
    '有料プラン（3カ月）',
    10400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000162',
    'b1000001-0001-4001-8001-000000000039',
    '有料プラン（6カ月）',
    15360,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000163',
    'b1000001-0001-4001-8001-000000000039',
    '有料プラン（12カ月）',
    25400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000164',
    'b1000001-0001-4001-8001-000000000040',
    'シンプルプラン web版（1カ月）',
    3700,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000165',
    'b1000001-0001-4001-8001-000000000040',
    'シンプルプラン web版（3カ月）',
    9300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000166',
    'b1000001-0001-4001-8001-000000000040',
    'シンプルプラン web版（6カ月）',
    13200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000167',
    'b1000001-0001-4001-8001-000000000040',
    'シンプルプラン web版（12カ月）',
    18200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000168',
    'b1000001-0001-4001-8001-000000000040',
    'シンプルプラン iOS/Android版（1カ月）',
    4900,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000169',
    'b1000001-0001-4001-8001-000000000040',
    'シンプルプラン iOS/Android版（3カ月）',
    11200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000170',
    'b1000001-0001-4001-8001-000000000040',
    'シンプルプラン iOS/Android版（6カ月）',
    16800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000171',
    'b1000001-0001-4001-8001-000000000040',
    'シンプルプラン iOS/Android版（12カ月）',
    23400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000172',
    'b1000001-0001-4001-8001-000000000040',
    'スタンダードプラン 女性（1カ月）',
    3100,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000173',
    'b1000001-0001-4001-8001-000000000040',
    'スタンダードプラン 女性（3カ月）',
    7600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000174',
    'b1000001-0001-4001-8001-000000000040',
    'スタンダードプラン 女性（6カ月）',
    12000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000175',
    'b1000001-0001-4001-8001-000000000040',
    'スタンダードプラン 女性（12カ月）',
    16800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000176',
    'b1000001-0001-4001-8001-000000000040',
    'スタンダードプラン 男性（1カ月）',
    7500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000177',
    'b1000001-0001-4001-8001-000000000040',
    'スタンダードプラン 男性（3カ月）',
    18000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000178',
    'b1000001-0001-4001-8001-000000000040',
    'スタンダードプラン 男性（6カ月）',
    25800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000179',
    'b1000001-0001-4001-8001-000000000040',
    'スタンダードプラン 男性（12カ月）',
    44800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000180',
    'b1000001-0001-4001-8001-000000000041',
    'Tinder Plus（1カ月）',
    1200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000181',
    'b1000001-0001-4001-8001-000000000041',
    'Tinder Plus（6カ月）',
    8300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000182',
    'b1000001-0001-4001-8001-000000000041',
    'Tinder Plus（12カ月）',
    11000,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000183',
    'b1000001-0001-4001-8001-000000000041',
    'Tinder Gold（1カ月）',
    3400,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000184',
    'b1000001-0001-4001-8001-000000000041',
    'Tinder Gold（6カ月）',
    12600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000185',
    'b1000001-0001-4001-8001-000000000041',
    'Tinder Gold（12カ月）',
    16800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000186',
    'b1000001-0001-4001-8001-000000000041',
    'Tinder Platinum（1カ月）',
    4300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000187',
    'b1000001-0001-4001-8001-000000000041',
    'Tinder Platinum（6カ月）',
    15800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000188',
    'b1000001-0001-4001-8001-000000000041',
    'Tinder Platinum（12カ月）',
    21800,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000189',
    'b1000001-0001-4001-8001-000000000042',
    'Super（年額・月あたり）',
    650,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000190',
    'b1000001-0001-4001-8001-000000000042',
    'Super（月額）',
    1200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000191',
    'b1000001-0001-4001-8001-000000000042',
    'Max（年額・月あたり）',
    1600,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000192',
    'b1000001-0001-4001-8001-000000000042',
    'Max（月額）',
    2500,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000193',
    'b1000001-0001-4001-8001-000000000043',
    '無料プラン',
    0,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000194',
    'b1000001-0001-4001-8001-000000000043',
    'プラスプラン',
    990,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000195',
    'b1000001-0001-4001-8001-000000000043',
    'プロプラン',
    2490,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000196',
    'b1000001-0001-4001-8001-000000000044',
    '個人向け定額プラン',
    2292,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000197',
    'b1000001-0001-4001-8001-000000000044',
    'チームプラン',
    3167,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000198',
    'b1000001-0001-4001-8001-000000000045',
    '月会費（店舗により異なる）',
    0,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000199',
    'b1000001-0001-4001-8001-000000000046',
    '月額（税込）',
    3278,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000200',
    'b1000001-0001-4001-8001-000000000047',
    '10食プラン',
    6206,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000201',
    'b1000001-0001-4001-8001-000000000047',
    '8食プラン',
    5157,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000202',
    'b1000001-0001-4001-8001-000000000047',
    '6食プラン',
    4318,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000203',
    'b1000001-0001-4001-8001-000000000048',
    'SUKIPASS',
    200,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000204',
    'b1000001-0001-4001-8001-000000000049',
    'おトクプランMAX',
    3300,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000205',
    'b1000001-0001-4001-8001-000000000049',
    'おトクプラン20',
    2320,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000206',
    'b1000001-0001-4001-8001-000000000050',
    '月額',
    980,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000207',
    'b1000001-0001-4001-8001-000000000051',
    '月額',
    498,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000208',
    'b1000001-0001-4001-8001-000000000051',
    '年額',
    3998,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'yearly')
  ),
  (
    'b2000001-0001-4001-8001-000000000209',
    'b1000001-0001-4001-8001-000000000052',
    'GO PASS',
    3980,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  ),
  (
    'b2000001-0001-4001-8001-000000000210',
    'b1000001-0001-4001-8001-000000000053',
    'CHARGESPOT Pass（月額固定）',
    2340,
    'JPY',
    (SELECT id FROM cycles WHERE name = 'monthly')
  )
ON CONFLICT (id) DO UPDATE SET
  service_id = EXCLUDED.service_id,
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  currency = EXCLUDED.currency,
  cycle_id = EXCLUDED.cycle_id;
