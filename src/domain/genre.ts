/**
 * サブスクのジャンル（カテゴリ）定義。
 * ドメイン層なので React / Supabase などには依存しない。
 *
 * - id: 内部値（DB 保存・分析で使う安定識別子。英小文字スネークケース）
 * - label: 画面に表示する日本語ラベル
 *
 * 関連機能: F-02（カスタム新規追加でジャンル選択）, F-06（ジャンル別支出の内訳）
 */

export const GENRE_IDS = [
  'ai',
  'video',
  'music',
  'game',
  'fitness',
  'ebook',
  'dating',
  'storage',
  'learning',
  'sns',
  'business',
  'food',
  'mobility',
  'design',
  'development',
  'utility',
  'other',
] as const;

export type GenreId = (typeof GENRE_IDS)[number];

export interface Genre {
  id: GenreId;
  label: string;
}

export const GENRES: readonly Genre[] = [
  { id: 'ai', label: 'AI' },
  { id: 'video', label: '動画配信' },
  { id: 'music', label: '音楽' },
  { id: 'game', label: 'ゲーム' },
  { id: 'fitness', label: 'フィットネス' },
  { id: 'ebook', label: '電子書籍' },
  { id: 'dating', label: 'マッチングアプリ' },
  { id: 'storage', label: 'ストレージ' },
  { id: 'learning', label: '学習' },
  { id: 'sns', label: 'SNS' },
  { id: 'business', label: 'ビジネス' },
  { id: 'food', label: '飲食' },
  { id: 'mobility', label: 'モビリティ' },
  { id: 'design', label: 'デザイン' },
  { id: 'development', label: '開発' },
  { id: 'utility', label: 'ユーティリティ' },
  { id: 'other', label: 'その他' },
];

export const DEFAULT_GENRE_ID: GenreId = 'other';

export function isGenreId(value: string): value is GenreId {
  return (GENRE_IDS as readonly string[]).includes(value);
}

export function getGenreLabel(id: GenreId): string {
  const genre = GENRES.find((g) => g.id === id);
  return genre?.label ?? id;
}
