# SubTrack

サブスクリプション契約・支出をまとめて把握・見直しするためのモバイルアプリ（[Expo](https://expo.dev) + React Native + TypeScript）。

## 前提

| 項目 | バージョン・備考 |
| --- | --- |
| Node.js | **22**（[CI](.github/workflows/ci.yml) と揃える） |
| パッケージマネージャ | npm（`package-lock.json` 使用） |
| Docker | ローカル Supabase 利用時に必要（[Supabase CLI](https://supabase.com/docs/guides/cli) 前提） |

## クイックスタート

1. 依存関係のインストール

   ```bash
   npm install
   ```

2. 環境変数（Supabase 接続）

   ```bash
   cp .env.example .env
   ```

   `.env` に **`EXPO_PUBLIC_SUPABASE_URL`** と **`EXPO_PUBLIC_SUPABASE_ANON_KEY`** を設定する。ローカル Supabase を使う場合は「[ローカル Supabase](#ローカル-supabase)」の出力値をそのまま利用できる。

3. アプリ起動

   ```bash
   npx expo start
   ```

## Git フック（初回のみ）

プッシュ前に `lint` / `typecheck` をかける場合など、[`.githooks/pre-push`](.githooks/pre-push) を有効にする。

```bash
./scripts/setup-hooks
```

詳細は [`docs/Rule.md`](docs/Rule.md) を参照。

## ローカル Supabase

1. [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) をインストールし、Docker を起動した状態でリポジトリ直下から:

   ```bash
   supabase start
   ```

2. API URL と `anon` key は次で確認できる。

   ```bash
   supabase status
   ```

   表示された **API URL** → `EXPO_PUBLIC_SUPABASE_URL`、**anon key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY` に設定する。

3. 終了するときは `supabase stop`。

### マイグレーション（概要）

**詳細手順**: [`docs/MIGRATIONS.md`](docs/MIGRATIONS.md)

**Supabase の Table Editor 等でテーブルを作らない。** スキーマは **`supabase/migrations/`** の SQL のみで管理する（原則・例外は [`docs/Rule.md`](docs/Rule.md)「データベーススキーマ」）。

スキーマの一次情報は [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md)。SQL の正は `supabase/migrations/` に置く。

```bash
# 新規マイグレーションファイルを追加（ファイル名は英語のスネークケース推奨）
supabase migration new add_example_table

# 編集後、ローカル DB に適用して検証
supabase db reset
```

運用の補足は [`docs/TRD.md`](docs/TRD.md) を参照。

### Edge Functions（任意）

**為替のプロキシ・Webhook・サーバー起点の通知など**で使う可能性がある。**ソースは `supabase/functions/` に置き、仕様は [`docs/API_DESIGN.md`](docs/API_DESIGN.md) に書く。**

```bash
supabase functions new my_function
supabase functions serve
# デプロイ: supabase functions deploy my_function
```

詳細は [Supabase Edge Functions](https://supabase.com/docs/guides/functions) を参照。

## 品質チェック（ローカル）

CI と同じコマンド。

```bash
npm run lint
npm run typecheck
```

## ドキュメント

| 内容 | パス |
| --- | --- |
| チーム開発（ブランチ・コミット・PR） | [`docs/Rule.md`](docs/Rule.md) |
| プロダクト要件 | [`docs/PRD.md`](docs/PRD.md) |
| 技術・ローカル方針の詳細 | [`docs/TRD.md`](docs/TRD.md) |
| 機能 F-01〜F-14 | [`docs/FEATURE_REQUIREMENTS.md`](docs/FEATURE_REQUIREMENTS.md) |
| DB / API 設計 | [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) / [`docs/API_DESIGN.md`](docs/API_DESIGN.md) |
| **DB マイグレーション手順** | [`docs/MIGRATIONS.md`](docs/MIGRATIONS.md) |
| **アプリのディレクトリ・採用方針** | [`docs/ARCHITECTURE_GUIDE.md`](docs/ARCHITECTURE_GUIDE.md) |
| Expo / TypeScript スタイル | [`docs/EXPO_TYPESCRIPT_CONVENTIONS.md`](docs/EXPO_TYPESCRIPT_CONVENTIONS.md) |

## Expo の参考

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction)
