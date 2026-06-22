# API 設計（API Design）

本書を API 仕様の**リポジトリ上の正**とする。`docs/TRD.md` §3 から参照する。

**提供形態は二系統**ある。

1. **Supabase PostgREST** — テーブルに対する自動 REST（**RLS が認可**）。主に Expo から `@supabase/supabase-js` 経由。
2. **Supabase Edge Functions** — HTTP エンドポイントとして追加する**サーバーサイド処理**（Deno + TypeScript）。**常時必須ではない**。必要になった関数だけ `docs/API_DESIGN.md` に追記する。

---

## 関連

| 種別             | 参照                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------- |
| 機能要件         | [`FEATURE_REQUIREMENTS.md`](./FEATURE_REQUIREMENTS.md)                                  |
| 技術全体         | [`TRD.md`](./TRD.md)                                                                    |
| 外部メモ（任意） | [API 設計（Notion）](https://www.notion.so/API-34829a9d481180528847f32d2552d630?pvs=21) |

---

## 概要

| 項目               | 内容                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| データ API         | Supabase Project URL + `/rest/v1/...`（PostgREST）。認証は通常 **Supabase JWT（anon + ユーザーセッション）** |
| Edge Functions     | `{SUPABASE_URL}/functions/v1/{function_name}`（デプロイ後に確定。ローカルは CLI の `serve` 出力に従う）      |
| API バージョニング | （未定。PostgREST はスキーマで調整、Edge はパス設計で調整）                                                  |
| 共通レスポンス形式 | PostgREST: 既定 JSON。Edge: **各関数で JSON を明示**（エラー形も揃える）                                     |

---

## PostgREST（自動 REST）

- アクセス可能なテーブル・ビュー・RPC は **`docs/DATABASE_DESIGN.md`** および **`supabase/migrations/`** と一致させる。
- **RLS だけでは表現しにくい認可**（例: 匿名向け読み取り）がある場合は、この節に表で書く。

### 主要リソース（予定）

| リソース（例） | メソッド概要 | 関連機能 ID |
| -------------- | ------------ | ----------- |
| （未定）       | （未定）     |             |

---

## Edge Functions

### 役割（いつ使うか）

| 用途                               | PostgREST だけで難しい理由         | SubTrack での想定                           |
| ---------------------------------- | ---------------------------------- | ------------------------------------------- |
| 外部 API の**秘密鍵**を隠す        | クライアントに埋め込むと漏洩       | **F-13** 為替レート取得・キャッシュ         |
| **Webhook** の受け口               | 署名検証・生ボディ処理             | 将来の外部連携                              |
| **スケジュールに近いサーバー処理** | クライアントはオフラインになりうる | **F-10** をサーバー起点にする場合（要設計） |

**まずは RLS + SQL（ビュー・関数）+ クライアント**で足りるか検討し、上記に該当するときだけ Edge を増やす。

### 実装・配置

| 項目         | 方針                                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| ランタイム   | Supabase 既定（Deno）                                                                                      |
| ソース       | リポジトリ `supabase/functions/{function_name}/`（**Git で管理**）                                         |
| ローカル     | `supabase functions serve`（[ローカル開発](https://supabase.com/docs/guides/functions/local-development)） |
| デプロイ     | `supabase functions deploy {function_name}`                                                                |
| シークレット | `supabase secrets set ...` で設定。**service_role をクライアントに渡さない**                               |

### 認証・セキュリティ

- ユーザー向け処理: **Authorization: Bearer &lt;ユーザーの access token&gt;** を検証し、必要なら Supabase クライアントで `auth.getUser()` 相当を行う。
- **公開してはいけないキー**（為替 API、FCM サーバーキー等）は Edge Function の環境変数のみに置く。
- 各関数の **JWT 検証の要否**（`verify_jwt`）は関数ごとに決め、`README` または下表に明記する。

### エンドポイント一覧（Edge）

| 関数ディレクトリ名 | メソッド | パス（相対）              | 概要                                                              | `verify_jwt` | 関連機能 |
| ------------------ | -------- | ------------------------- | ----------------------------------------------------------------- | ------------ | -------- |
| `line-webhook`     | POST     | `/functions/v1/line-webhook`     | LINE Webhook 受け口。署名検証 → 連携コード照合 / postback で利用記録 | false        | F-08     |
| `line-daily-push`  | POST     | `/functions/v1/line-daily-push`  | 連携済みユーザーへ「使った/使ってない」ボタンを毎日プッシュ          | false        | F-08     |
| `fx-rates`         | GET/POST | `/functions/v1/fx-rates`           | 為替レート取得（Frankfurter プロキシ・1 日キャッシュ）                     | true         | F-13     |

- `line-webhook` は LINE の署名（`X-Line-Signature`）で保護するため JWT 検証は無効化する。
- `line-daily-push` は cron（pg_cron / 外部スケジューラ）から呼び、`CRON_SECRET`（任意）で簡易保護する。
- `fx-rates` はログインユーザーの JWT で保護する。未デプロイ時はクライアントが Frankfurter API へフォールバックする。
- 詳細・セットアップ手順は [`supabase/functions/README.md`](../supabase/functions/README.md)。

---

## 認証・認可（全体）

- **モバイル → Supabase データ**: Auth セッション + RLS。
- **モバイル → Edge**: 関数ごとにトークン必須か、サービス間かを上表で固定する。

---

## エラー仕様

| 区分           | HTTP / 形式                                                                     | クライアントの扱い             |
| -------------- | ------------------------------------------------------------------------------- | ------------------------------ |
| PostgREST      | Supabase 既定 + PostgreSQL エラー                                               | 共通ハンドリングを定義（未定） |
| Edge Functions | **各関数で JSON エラー形を統一**（例: `{ "error": "code", "message": "..." }`） | 同上                           |

---

## OpenAPI / 型定義

- PostgREST: （OpenAPI 生成の利用の有無は未定）
- Edge: 関数が増えたら **paths をこの文書または別 yaml に列挙**する

---

## 変更履歴

| 日付       | 変更内容                                                |
| ---------- | ------------------------------------------------------- |
| 2026-06-22 | F-13 為替レート取得 Edge Function（fx-rates）を追記 |
| 2026-06-06 | LINE 連携の Edge Functions（line-webhook / line-daily-push）を追記 |
| 2026-05-15 | Edge Functions の採用方針・PostgREST との住み分けを追記 |
| （追記）   |                                                         |
