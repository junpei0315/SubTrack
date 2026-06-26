/* eslint-disable */
// 一時生成スクリプト: Notion「主要サブスク一覧」を正として
// docs/preset-services-template.csv と
// supabase/migrations/20260606120100_seed_preset_services_plans.sql を再生成する。
// 使い終わったら削除してよい。
//   node scripts/generate-preset-seed.js
//
// 注意:
// - service / plan の UUID は配列順の連番で採番している（serviceUuid / planUuid）。
//   既存行の並べ替え・削除は適用済みマイグレーションと UUID がずれるため不可。
// - price = 0 の無料プランは支出管理上の意味が薄いため、後続マイグレーション
//   20260609120000 で削除している。ここでは UUID 連番維持のため敢えて残している。

const fs = require('fs');
const path = require('path');

// category_id は src/domain/genre.ts と DATABASE_DESIGN.md の17ジャンルに対応。
const CAT = {
  ai: 1,
  video: 2,
  music: 3,
  game: 4,
  fitness: 5,
  ebook: 6,
  dating: 7,
  storage: 8,
  learning: 9,
  sns: 10,
  business: 11,
  food: 12,
  mobility: 13,
  design: 14,
  development: 15,
  utility: 16,
  other: 17,
};

const CAT_LABEL = {
  1: 'AI',
  2: '動画配信',
  3: '音楽',
  4: 'ゲーム',
  5: 'フィットネス',
  6: '電子書籍',
  7: 'マッチングアプリ',
  8: 'ストレージ',
  9: '学習',
  10: 'SNS',
  11: 'ビジネス',
  12: '飲食',
  13: 'モビリティ',
  14: 'デザイン',
  15: '開発',
  16: 'ユーティリティ',
  17: 'その他',
};

const M = 'monthly';
const Y = 'yearly';

// services: { name, cat, logoKey, logoUri, plans: [name, price, currency, cycle][] }
const services = [
  { name: 'Netflix', cat: CAT.video, logoKey: 'netflix', plans: [
    ['広告つきスタンダード', 890, 'JPY', M],
    ['スタンダード', 1590, 'JPY', M],
    ['プレミアム', 2290, 'JPY', M],
  ] },
  { name: 'Spotify', cat: CAT.music, logoKey: 'spotify', plans: [
    ['Standard', 1080, 'JPY', M],
    ['Student', 580, 'JPY', M],
    ['Duo', 1480, 'JPY', M],
    ['Family', 1880, 'JPY', M],
  ] },
  { name: 'Hulu', cat: CAT.video, logoKey: 'hulu', plans: [
    ['月額', 1026, 'JPY', M],
  ] },
  { name: 'Amazon Prime Video', cat: CAT.video, logoKey: 'amazonprime', plans: [
    ['プライム（月間）', 600, 'JPY', M],
    ['プライム（年間）', 5900, 'JPY', Y],
    ['Prime Student（月間）', 300, 'JPY', M],
    ['Prime Student（年間）', 2950, 'JPY', Y],
  ] },
  { name: 'U-NEXT', cat: CAT.video, logoKey: 'unext', plans: [
    ['月額利用料', 2189, 'JPY', M],
  ] },
  { name: 'Disney+', cat: CAT.video, logoKey: 'disneyplus', plans: [
    ['スタンダード（月額）', 1250, 'JPY', M],
    ['プレミアム（月額）', 1670, 'JPY', M],
    ['スタンダード（年額）', 12500, 'JPY', Y],
    ['プレミアム（年額）', 16700, 'JPY', Y],
  ] },
  { name: 'DAZN', cat: CAT.video, logoKey: 'dazn', plans: [
    ['DAZNスタンダード（月額更新）', 4200, 'JPY', M],
    ['DAZNスタンダード（年額前払い）', 32000, 'JPY', Y],
    ['DAZNスタンダード（年額分割払い）', 3200, 'JPY', M],
    ['DAZNサッカー（年額分割払い）', 2600, 'JPY', M],
    ['DAZNグローバル（月額更新）', 980, 'JPY', M],
    ['DAZNベースボール（年額前払い）', 27600, 'JPY', Y],
    ['DAZNベースボール（年額分割払い）', 2300, 'JPY', M],
    ['ABEMA de DAZN学割（月額更新）', 1600, 'JPY', M],
    ['ABEMA de DAZN学割（年額前払い）', 16000, 'JPY', Y],
    ['DAZN W杯（月額更新）', 1980, 'JPY', M],
  ] },
  { name: 'ABEMA', cat: CAT.video, logoKey: 'abema', plans: [
    ['広告つきABEMAプレミアム', 680, 'JPY', M],
    ['ABEMAプレミアム', 1180, 'JPY', M],
    ['広告つきABEMAプレミアム｜Disney+スタンダード', 1640, 'JPY', M],
    ['ABEMAプレミアム｜Disney+スタンダード', 1860, 'JPY', M],
    ['広告つきABEMAプレミアム｜Disney+プレミアム', 2000, 'JPY', M],
    ['ABEMAプレミアム｜Disney+プレミアム', 2190, 'JPY', M],
  ] },
  { name: 'FANZA', cat: CAT.video, logoKey: 'fanza', plans: [
    ['FANZA TV（DMMプレミアム）', 550, 'JPY', M],
    ['FANZA TV Plus', 1628, 'JPY', M],
    ['見放題ch', 3980, 'JPY', M],
    ['見放題chデラックス', 8980, 'JPY', M],
    ['VR ch', 2800, 'JPY', M],
  ] },
  { name: 'YouTube Premium', cat: CAT.video, logoKey: 'youtube', plans: [
    ['個人', 1280, 'JPY', M],
    ['ファミリー', 2280, 'JPY', M],
    ['学生', 780, 'JPY', M],
    ['Premium Lite', 780, 'JPY', M],
  ] },
  { name: 'YouTube Music', cat: CAT.music, logoKey: 'youtubemusic', plans: [
    ['個人（月額）', 1080, 'JPY', M],
    ['個人（年額）', 10800, 'JPY', Y],
    ['ファミリー', 1680, 'JPY', M],
    ['学生', 580, 'JPY', M],
  ] },
  { name: 'Apple Music', cat: CAT.music, logoKey: 'applemusic', plans: [
    ['個人', 1080, 'JPY', M],
    ['ファミリー', 1680, 'JPY', M],
    ['学生', 580, 'JPY', M],
  ] },
  { name: 'LINE MUSIC', cat: CAT.music, logoKey: null,
    logoUri: 'https://upload.wikimedia.org/wikipedia/commons/3/33/LINEMUSIC.png', plans: [
    ['一般', 1080, 'JPY', M],
    ['一般（LINE STORE限定）', 980, 'JPY', M],
    ['学生', 580, 'JPY', M],
    ['学生（LINE STORE限定）', 480, 'JPY', M],
    ['ファミリー', 1680, 'JPY', M],
  ] },
  { name: 'ChatGPT', cat: CAT.ai, logoKey: 'chatgpt', plans: [
    ['無料版', 0, 'JPY', M],
    ['Go', 1400, 'JPY', M],
    ['Plus', 3000, 'JPY', M],
    ['Pro', 16800, 'JPY', M],
    ['ビジネス', 3050, 'JPY', M],
  ] },
  { name: 'Claude', cat: CAT.ai, logoKey: 'claude', plans: [
    ['無料', 0, 'USD', M],
    ['Pro', 20, 'USD', M],
    ['Max', 100, 'USD', M],
  ] },
  { name: 'Gemini', cat: CAT.ai, logoKey: 'gemini', plans: [
    ['無料', 0, 'JPY', M],
    ['Google AI Plus', 725, 'JPY', M],
    ['Google AI Pro', 2900, 'JPY', M],
    ['Google AI Ultra', 14500, 'JPY', M],
  ] },
  { name: 'Cursor', cat: CAT.ai, logoKey: 'cursor', plans: [
    ['Hobby（月払い）', 0, 'USD', M],
    ['個人（月払い）', 20, 'USD', M],
    ['Teams（月払い）', 40, 'USD', M],
    ['Hobby（年払い）', 0, 'USD', Y],
    ['個人（年払い・月あたり）', 16, 'USD', Y],
    ['Teams（年払い・月あたり）', 32, 'USD', Y],
  ] },
  { name: 'GitHub', cat: CAT.development, logoKey: 'github', plans: [
    ['Team（月払い）', 4, 'USD', M],
    ['Enterprise（月払い）', 21, 'USD', M],
    ['Team（年払い）', 48, 'USD', Y],
    ['Enterprise（年払い）', 252, 'USD', Y],
  ] },
  { name: 'Notion', cat: CAT.business, logoKey: 'notion', plans: [
    ['プラス（月払い）', 2000, 'JPY', M],
    ['ビジネス（月払い）', 3800, 'JPY', M],
    ['プラス（年払い・月あたり）', 1650, 'JPY', Y],
    ['ビジネス（年払い・月あたり）', 3150, 'JPY', Y],
  ] },
  { name: 'Slack', cat: CAT.business, logoKey: 'slack', plans: [
    ['プロ（年払い・月あたり）', 925, 'JPY', Y],
    ['プロ（月払い）', 1920, 'JPY', M],
  ] },
  { name: 'Figma', cat: CAT.design, logoKey: 'figma', plans: [
    ['プロフェッショナル フルシート（月払い）', 3000, 'JPY', M],
    ['プロフェッショナル Devシート（月払い）', 2250, 'JPY', M],
    ['プロフェッショナル コラボシート（月払い）', 750, 'JPY', M],
    ['プロフェッショナル フルシート（年払い・月あたり）', 2400, 'JPY', Y],
    ['プロフェッショナル Devシート（年払い・月あたり）', 1800, 'JPY', Y],
    ['プロフェッショナル コラボシート（年払い・月あたり）', 450, 'JPY', Y],
    ['ビジネス フルシート', 8300, 'JPY', M],
    ['ビジネス Devシート', 3750, 'JPY', M],
    ['ビジネス コラボシート', 750, 'JPY', M],
    ['エンタープライズ フルシート', 13600, 'JPY', M],
    ['エンタープライズ Devシート', 5250, 'JPY', M],
    ['エンタープライズ コラボシート', 750, 'JPY', M],
  ] },
  { name: 'Canva', cat: CAT.design, logoKey: 'canva', plans: [
    ['プロ', 8300, 'JPY', Y],
    ['ビジネス', 18800, 'JPY', Y],
  ] },
  { name: 'DeepL', cat: CAT.ai, logoKey: 'deepl', plans: [
    ['Individual（月払い）', 1380, 'JPY', M],
    ['Team（月払い）', 4500, 'JPY', M],
    ['Business（月払い）', 9000, 'JPY', M],
    ['Individual（年払い・月あたり）', 1150, 'JPY', Y],
    ['Team（年払い・月あたり）', 3750, 'JPY', Y],
    ['Business（年払い・月あたり）', 7500, 'JPY', Y],
  ] },
  { name: 'Dropbox', cat: CAT.storage, logoKey: 'dropbox', plans: [
    ['Plus（月払い）', 1500, 'JPY', M],
    ['Professional（月払い）', 2400, 'JPY', M],
    ['Standard（月払い）', 1800, 'JPY', M],
    ['Advanced（月払い）', 2800, 'JPY', M],
    ['Plus（年払い・月あたり）', 1200, 'JPY', Y],
    ['Professional（年払い・月あたり）', 2000, 'JPY', Y],
    ['Standard（年払い・月あたり）', 1500, 'JPY', Y],
    ['Advanced（年払い・月あたり）', 2400, 'JPY', Y],
  ] },
  { name: 'Google One', cat: CAT.storage, logoKey: 'googleone', plans: [
    ['Basic（月払い）', 290, 'JPY', M],
    ['Google AI Plus 200GB（月払い）', 1200, 'JPY', M],
    ['Google AI Plus 2TB（月払い）', 1450, 'JPY', M],
    ['Google AI Pro 5TB（月払い）', 2900, 'JPY', M],
    ['Basic（年払い）', 2900, 'JPY', Y],
    ['Google AI Plus 200GB（年払い）', 12000, 'JPY', Y],
    ['Google AI Plus 2TB（年払い）', 14500, 'JPY', Y],
    ['Google AI Pro 5TB（年払い）', 29000, 'JPY', Y],
  ] },
  { name: 'iCloud+', cat: CAT.storage, logoKey: 'icloud', plans: [
    ['50GB', 150, 'JPY', M],
    ['200GB', 450, 'JPY', M],
    ['2TB', 1500, 'JPY', M],
  ] },
  { name: 'GoodNotes', cat: CAT.business, logoKey: 'goodnotes', plans: [
    ['年額', 1350, 'JPY', Y],
  ] },
  { name: 'Apple One', cat: CAT.other, logoKey: 'apple', plans: [
    ['個人', 1200, 'JPY', M],
    ['ファミリー', 1980, 'JPY', M],
  ] },
  { name: 'AppleCare+', cat: CAT.other, logoKey: null,
    logoUri: 'https://www.apple.com/legal/images/icon_applecare_plus_rnd/icon_applecare_plus_rnd_large_2x.png', plans: [
    ['iPhone（2年間）', 19800, 'JPY', Y],
    ['Mac（3年間）', 15400, 'JPY', Y],
    ['ディスプレイ（3年間）', 23400, 'JPY', Y],
    ['iPad（2年間）', 10800, 'JPY', Y],
    ['Watch（2年間）', 7400, 'JPY', Y],
    ['Vision（2年間）', 68800, 'JPY', Y],
    ['ヘッドフォン（2年間）', 4600, 'JPY', Y],
    ['TV（3年間）', 4200, 'JPY', Y],
    ['HomePod（2年間）', 2200, 'JPY', Y],
  ] },
  { name: 'Simeji', cat: CAT.utility, logoKey: 'simeji', plans: [
    ['月額プラン', 400, 'JPY', M],
    ['年額プラン', 2400, 'JPY', Y],
  ] },
  { name: 'Nintendo Switch Online', cat: CAT.game, logoKey: 'nintendo', plans: [
    ['個人プラン（月額）', 306, 'JPY', M],
    ['個人プラン（3ヶ月）', 815, 'JPY', M],
    ['個人プラン（年額）', 2400, 'JPY', Y],
    ['個人プラン+追加パック（年額）', 4900, 'JPY', Y],
    ['ファミリープラン（年額）', 4500, 'JPY', Y],
    ['ファミリープラン+追加パック（年額）', 8900, 'JPY', Y],
  ] },
  { name: 'PlayStation Plus', cat: CAT.game, logoKey: 'playstation', plans: [
    ['プレミアム（月額）', 1550, 'JPY', M],
    ['プレミアム（3ヶ月）', 4300, 'JPY', M],
    ['プレミアム（年額）', 13900, 'JPY', Y],
    ['エクストラ（月額）', 1300, 'JPY', M],
    ['エクストラ（3ヶ月）', 3600, 'JPY', M],
    ['エクストラ（年額）', 11700, 'JPY', Y],
    ['エッセンシャル（月額）', 850, 'JPY', M],
    ['エッセンシャル（3ヶ月）', 2150, 'JPY', M],
    ['エッセンシャル（年額）', 6800, 'JPY', Y],
  ] },
  { name: 'Kindle Unlimited', cat: CAT.ebook, logoKey: 'kindle', plans: [
    ['月額', 980, 'JPY', M],
  ] },
  { name: 'Audible', cat: CAT.ebook, logoKey: 'audible', plans: [
    ['月額', 1500, 'JPY', M],
  ] },
  { name: 'dマガジン', cat: CAT.ebook, logoKey: 'dmagazine', plans: [
    ['月額', 580, 'JPY', M],
  ] },
  { name: 'コミックシーモア', cat: CAT.ebook, logoKey: 'cmoa', plans: [
    ['読み放題フル', 1480, 'JPY', M],
  ] },
  { name: 'pixivプレミアム', cat: CAT.design, logoKey: 'pixiv', plans: [
    ['プレミアム', 590, 'JPY', M],
  ] },
  { name: 'X', cat: CAT.sns, logoKey: 'x', plans: [
    ['ベーシック（月額）', 368, 'JPY', M],
    ['ベーシック（年額）', 3916, 'JPY', Y],
    ['プレミアム（月額）', 980, 'JPY', M],
    ['プレミアム（年額）', 10280, 'JPY', Y],
    ['プレミアムプラス（月額）', 6080, 'JPY', M],
    ['プレミアムプラス（年額）', 60040, 'JPY', Y],
  ] },
  { name: 'Pairs', cat: CAT.dating, logoKey: 'pairs', plans: [
    ['男性有料会員（1カ月）', 4100, 'JPY', M],
    ['男性有料会員（3カ月）', 9100, 'JPY', M],
    ['男性有料会員（6カ月）', 14200, 'JPY', M],
    ['男性有料会員（12カ月）', 20100, 'JPY', Y],
  ] },
  { name: 'with', cat: CAT.dating, logoKey: 'with', plans: [
    ['有料プラン（1カ月）', 4160, 'JPY', M],
    ['有料プラン（3カ月）', 10400, 'JPY', M],
    ['有料プラン（6カ月）', 15360, 'JPY', M],
    ['有料プラン（12カ月）', 25400, 'JPY', Y],
  ] },
  { name: 'タップル', cat: CAT.dating, logoKey: 'tapple', plans: [
    ['シンプルプラン web版（1カ月）', 3700, 'JPY', M],
    ['シンプルプラン web版（3カ月）', 9300, 'JPY', M],
    ['シンプルプラン web版（6カ月）', 13200, 'JPY', M],
    ['シンプルプラン web版（12カ月）', 18200, 'JPY', Y],
    ['シンプルプラン iOS/Android版（1カ月）', 4900, 'JPY', M],
    ['シンプルプラン iOS/Android版（3カ月）', 11200, 'JPY', M],
    ['シンプルプラン iOS/Android版（6カ月）', 16800, 'JPY', M],
    ['シンプルプラン iOS/Android版（12カ月）', 23400, 'JPY', Y],
    ['スタンダードプラン 女性（1カ月）', 3100, 'JPY', M],
    ['スタンダードプラン 女性（3カ月）', 7600, 'JPY', M],
    ['スタンダードプラン 女性（6カ月）', 12000, 'JPY', M],
    ['スタンダードプラン 女性（12カ月）', 16800, 'JPY', Y],
    ['スタンダードプラン 男性（1カ月）', 7500, 'JPY', M],
    ['スタンダードプラン 男性（3カ月）', 18000, 'JPY', M],
    ['スタンダードプラン 男性（6カ月）', 25800, 'JPY', M],
    ['スタンダードプラン 男性（12カ月）', 44800, 'JPY', Y],
  ] },
  { name: 'Tinder', cat: CAT.dating, logoKey: 'tinder', plans: [
    ['Tinder Plus（1カ月）', 1200, 'JPY', M],
    ['Tinder Plus（6カ月）', 8300, 'JPY', M],
    ['Tinder Plus（12カ月）', 11000, 'JPY', Y],
    ['Tinder Gold（1カ月）', 3400, 'JPY', M],
    ['Tinder Gold（6カ月）', 12600, 'JPY', M],
    ['Tinder Gold（12カ月）', 16800, 'JPY', Y],
    ['Tinder Platinum（1カ月）', 4300, 'JPY', M],
    ['Tinder Platinum（6カ月）', 15800, 'JPY', M],
    ['Tinder Platinum（12カ月）', 21800, 'JPY', Y],
  ] },
  { name: 'Duolingo', cat: CAT.learning, logoKey: 'duolingo', plans: [
    ['Super（年額・月あたり）', 650, 'JPY', Y],
    ['Super（月額）', 1200, 'JPY', M],
    ['Max（年額・月あたり）', 1600, 'JPY', Y],
    ['Max（月額）', 2500, 'JPY', M],
  ] },
  { name: 'Progate', cat: CAT.learning, logoKey: 'progate', plans: [
    ['無料プラン', 0, 'JPY', M],
    ['プラスプラン', 990, 'JPY', M],
    ['プロプラン', 2490, 'JPY', M],
  ] },
  { name: 'Udemy', cat: CAT.learning, logoKey: 'udemy', plans: [
    ['個人向け定額プラン', 2292, 'JPY', M],
    ['チームプラン', 3167, 'JPY', M],
  ] },
  { name: 'エニタイムフィットネス', cat: CAT.fitness, logoKey: 'anytimefitness.co', plans: [
    ['月会費（店舗により異なる）', 0, 'JPY', M],
  ] },
  { name: 'chocoZAP', cat: CAT.fitness, logoKey: 'chocozap', plans: [
    ['月額（税込）', 3278, 'JPY', M],
  ] },
  { name: 'nosh', cat: CAT.food, logoKey: 'nosh', plans: [
    ['10食プラン', 6206, 'JPY', M],
    ['8食プラン', 5157, 'JPY', M],
    ['6食プラン', 4318, 'JPY', M],
  ] },
  { name: 'すき家', cat: CAT.food, logoKey: 'sukiya', plans: [
    ['SUKIPASS', 200, 'JPY', M],
  ] },
  { name: 'Coke ON', cat: CAT.utility, logoKey: 'cocacola', plans: [
    ['おトクプランMAX', 3300, 'JPY', M],
    ['おトクプラン20', 2320, 'JPY', M],
  ] },
  { name: 'LUUP', cat: CAT.mobility, logoKey: 'luup', plans: [
    ['月額', 980, 'JPY', M],
  ] },
  { name: 'Uber One', cat: CAT.food, logoKey: 'uber', plans: [
    ['月額', 498, 'JPY', M],
    ['年額', 3998, 'JPY', Y],
  ] },
  { name: 'GO', cat: CAT.mobility, logoKey: 'goinc', plans: [
    ['GO PASS', 3980, 'JPY', M],
  ] },
  { name: 'ChargeSPOT', cat: CAT.utility, logoKey: 'chargespot', plans: [
    ['CHARGESPOT Pass（月額固定）', 2340, 'JPY', M],
  ] },
];

function sq(v) {
  if (v === null || v === undefined) return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}

function pad(n, len) {
  return String(n).padStart(len, '0');
}

function serviceUuid(i) {
  return `b1000001-0001-4001-8001-${pad(i, 12)}`;
}

function planUuid(i) {
  return `b2000001-0001-4001-8001-${pad(i, 12)}`;
}

// --- SQL 生成 ---
let sql = '';
sql += '-- ============================================================================\n';
sql += '-- プリセットサブスクマスタ（cycles / categories / services / plans）\n';
sql += '-- ----------------------------------------------------------------------------\n';
sql += '-- 出典: Notion「主要サブスク一覧」を正とする（各値は要レビュー）。\n';
sql += '-- cycle は monthly / yearly / weekly のみ。3ヶ月・期間保証などはプラン名に\n';
sql += '-- 期間を併記し、近い cycle に丸めている。\n';
sql += '-- logo_key は assets/services/{logo_key}.jpeg と対応（無い場合は NULL）。\n';
sql += '-- このファイルは scripts/generate-preset-seed.js から自動生成。\n';
sql += '-- 設計書: docs/DATABASE_DESIGN.md\n';
sql += '-- ============================================================================\n\n';

sql += "INSERT INTO cycles (name) VALUES\n  ('monthly'),\n  ('yearly'),\n  ('weekly')\nON CONFLICT (name) DO NOTHING;\n\n";

sql += 'INSERT INTO categories (id, name, color_code, icon_name) VALUES\n';
const cats = [
  [1, 'AI', '#10a37f', 'sparkles'],
  [2, '動画配信', '#ff3a5e', 'play-circle'],
  [3, '音楽', '#1db954', 'music'],
  [4, 'ゲーム', '#5865f2', 'gamepad-2'],
  [5, 'フィットネス', '#ff6b35', 'dumbbell'],
  [6, '電子書籍', '#f4a261', 'book-open'],
  [7, 'マッチングアプリ', '#e91e63', 'heart'],
  [8, 'ストレージ', '#4285f4', 'hard-drive'],
  [9, '学習', '#7c3aed', 'graduation-cap'],
  [10, 'SNS', '#1da1f2', 'share-2'],
  [11, 'ビジネス', '#6366f1', 'briefcase'],
  [12, '飲食', '#ef4444', 'utensils'],
  [13, 'モビリティ', '#000000', 'car'],
  [14, 'デザイン', '#ff0000', 'palette'],
  [15, '開発', '#333333', 'code'],
  [16, 'ユーティリティ', '#64748b', 'wrench'],
  [17, 'その他', '#9aa0a6', 'more-horizontal'],
];
sql += cats.map((c) => `  (${c[0]}, ${sq(c[1])}, ${sq(c[2])}, ${sq(c[3])})`).join(',\n');
sql += '\nON CONFLICT (id) DO UPDATE SET\n  name = EXCLUDED.name,\n  color_code = EXCLUDED.color_code,\n  icon_name = EXCLUDED.icon_name;\n\n';
sql += "SELECT setval(\n  pg_get_serial_sequence('categories', 'id'),\n  (SELECT COALESCE(MAX(id), 1) FROM categories)\n);\n\n";

// services
sql += 'INSERT INTO services (id, name, category_id, logo_key, logo_uri, icon_name) VALUES\n';
const serviceRows = services.map((s, idx) => {
  const id = serviceUuid(idx + 1);
  return `  (${sq(id)}, ${sq(s.name)}, ${s.cat}, ${sq(s.logoKey ?? null)}, ${sq(s.logoUri ?? null)}, NULL)`;
});
sql += serviceRows.join(',\n');
sql += '\nON CONFLICT (id) DO UPDATE SET\n  name = EXCLUDED.name,\n  category_id = EXCLUDED.category_id,\n  logo_key = EXCLUDED.logo_key,\n  logo_uri = EXCLUDED.logo_uri;\n\n';

// plans
sql += 'INSERT INTO plans (id, service_id, name, price, currency, cycle_id) VALUES\n';
const planRows = [];
let planCounter = 0;
const csvRows = [['service_slug', 'service_name', 'category_id', 'category_label', 'plan_name', 'price', 'currency', 'cycle']];
services.forEach((s, sIdx) => {
  const sid = serviceUuid(sIdx + 1);
  const slug = s.logoKey ?? s.name;
  s.plans.forEach((p) => {
    planCounter += 1;
    const pid = planUuid(planCounter);
    planRows.push(
      `  (\n    ${sq(pid)},\n    ${sq(sid)},\n    ${sq(p[0])},\n    ${p[1]},\n    ${sq(p[2])},\n    (SELECT id FROM cycles WHERE name = ${sq(p[3])})\n  )`
    );
    csvRows.push([slug, s.name, s.cat, CAT_LABEL[s.cat], p[0], p[1], p[2], p[3]]);
  });
});
sql += planRows.join(',\n');
sql += '\nON CONFLICT (id) DO UPDATE SET\n  service_id = EXCLUDED.service_id,\n  name = EXCLUDED.name,\n  price = EXCLUDED.price,\n  currency = EXCLUDED.currency,\n  cycle_id = EXCLUDED.cycle_id;\n';

// --- CSV 生成 ---
const csv = csvRows.map((r) => r.join(',')).join('\n') + '\n';

const root = path.resolve(__dirname, '..');
fs.writeFileSync(
  path.join(root, 'supabase/migrations/20260606120100_seed_preset_services_plans.sql'),
  sql
);
fs.writeFileSync(path.join(root, 'docs/preset-services-template.csv'), csv);

console.log(`services: ${services.length}`);
console.log(`plans: ${planCounter}`);
// レビュー用に主要プランの UUID を出力
const wanted = [
  ['Netflix', 'プレミアム'],
  ['Spotify', 'Standard'],
  ['ChatGPT', 'Plus'],
  ['Canva', 'プロ'],
];
let c2 = 0;
const map = {};
services.forEach((s) => {
  s.plans.forEach((p) => {
    c2 += 1;
    map[`${s.name}|${p[0]}`] = planUuid(c2);
  });
});
wanted.forEach((w) => {
  console.log(`${w[0]} / ${w[1]} => ${map[`${w[0]}|${w[1]}`]}`);
});
