# DB マイグレーション手順（Supabase）

PostgreSQL（Supabase）のスキーマ変更を **`supabase/migrations/*.sql`** にだけ残し、チームで再現できるようにするための手順書。  
**原則・禁止事項（UI 直編集の禁止など）**は [`docs/Rule.md`](./Rule.md)「データベーススキーマ（Supabase）」を正とする。

---

## 関連ドキュメント

| 内容 | パス |
| --- | --- |
| スキーマ意図（テーブル・列・ER） | [`docs/DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) |
| 技術方針・ローカル概要 | [`docs/TRD.md`](./TRD.md) §1 |
| クイックコマンド | [`README.md`](../README.md)「ローカル Supabase」 |
| CI / 品質 | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)（DB マイグレは未実行の場合あり） |

---

## 前提

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) が入っている
- **Docker** が起動できる（`supabase start` 用）
- リポジトリ直下で作業する

---

## 基本方針（再掲）

- **Supabase ダッシュボードの Table Editor / SQL Editor で、共有環境のスキーマを直接変えない**（原則）。例外と追認は `docs/Rule.md`。
- **意図の説明**は `docs/DATABASE_DESIGN.md`、**実行可能な真実**は `supabase/migrations/`。PR では両方を整合させる。

---

## ローカル開発サイクル（通常）

### 1. ブランチを切る

`develop` から feature ブランチ（例: `feature/AddSubscriptionsTable`）。

### 2. ローカル Supabase を起動

```bash
supabase start
```

初回はイメージ取得に時間がかかる。止めるときは `supabase stop`。

### 3. 空のマイグレーションファイルを作る

```bash
supabase migration new <英語のスネーク_caseで内容がわかる名前>
```

例:

```none
supabase migration new create_profiles_table
```

`supabase/migrations/` に `YYYYMMDDHHMMSS_create_profiles_table.sql` が追加される。

### 4. SQL を書く

- 編集するのは **その 1 ファイルだけ**にし、**`docs/DATABASE_DESIGN.md` と矛盾しない**ようにする。
- **RLS** を有効にするテーブルは、同じマイグレーションまたは**直後のマイグレーション**でポリシーまで含める（「テーブルだけ作って無防備のまま」にしない）。
- 必要なら `CREATE EXTENSION` や **関数・トリガー**も同じ流れで version 管理する。

### 5. ローカル DB に適用して検証

```bash
supabase db reset
```

**ローカルデータは消える。** マイグレーションを先頭から順に当て直す。エラーが出たら SQL を直し、再度 `db reset` する。

### 6. アプリまたは Studio で確認

- [Supabase Studio](https://supabase.com/docs/guides/local-development/cli/using-studio)（ローカル）でテーブル・ポリシーを目視する。
- 必要なら Expo から `EXPO_PUBLIC_*` をローカル URL に向けて動作確認する。

### 7. PR に含めるもの

- `supabase/migrations/` の変更
- `docs/DATABASE_DESIGN.md`（およびテーブル一覧・変更履歴）の更新
- レビュー観点は [`.github/pull_request_template.md`](../.github/pull_request_template.md)、ルールは `docs/Rule.md`

**1 PR に 1 つのテーマ**（無関係な DDL を混ぜない）を推奨。

---

## リモート（Staging / 本番）への反映

運用はプロジェクトで固める。**CLI の選択肢の例**（詳細は [公式: Database Migrations](https://supabase.com/docs/guides/cli/managing-environments)）:

- `supabase db push`（リンク済みプロジェクトへ）
- CI からの適用
- ダッシュボードの **Migration 履歴** と突き合わせ

**本番前**に、同じマイグレーションで **Staging またはローカルで `db reset` 済み**であることを確認する。

確定した手順が決まったら**本節に追記**し、`docs/TRD.md` の「本番・Staging への適用フロー」と同期する。

---

## 緊急時（例外）

本番のみ GUI / 直 SQL で触った場合は **`docs/Rule.md`** の例外節に従い、**速やかに同等のマイグレーションと設計書の PR** で追認する。

---

## よくあるつまずき

| 症状 | 対処のヒント |
| --- | --- |
| `db reset` でマイグレーション失敗 | 失敗したファイルの SQL を修正。**既にリモートに出したマイグレーション**は書き換えず、**新しいファイルで修正**する運用が安全。 |
| RLS 有効でクライアントから何も読めない | ポリシーが未作成、または `auth.uid()` 条件が合っていない。 Studio で `auth` コンテキストを意識して確認。 |
| ローカルとドキュメントのテーブル名が違う | **物理名は snake_case**。`DATABASE_DESIGN.md` を正として揃える。 |

---

## 変更履歴

| 日付 | 内容 |
| --- | --- |
| 2026-05-15 | 初版 |
