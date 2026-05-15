# TRD（Technical Requirements Document）

**目的**: PRD で定義した「何を作るか」を受けて、「どう作るか」をエンジニアが実装できるレベルで定義する文書。

本リポジトリでは `docs/PRD.md`、`docs/FEATURE_REQUIREMENTS.md` と本書を**技術判断の参照元**とする。API 詳細は [`docs/API_DESIGN.md`](./API_DESIGN.md)、DB 詳細は [`docs/DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) に集約し、**実装されたスキーマは `supabase/migrations/` と必ず一致させる**。Notion 等は補助リンクとして残す。

---

## 0. 関連ドキュメント

| ドキュメント | リンク |
| --- | --- |
| PRD（リポジトリ） | [`docs/PRD.md`](./PRD.md) |
| 機能要件 F-01〜F-14（リポジトリ） | [`docs/FEATURE_REQUIREMENTS.md`](./FEATURE_REQUIREMENTS.md) |
| API 設計（リポジトリ） | [`docs/API_DESIGN.md`](./API_DESIGN.md) |
| DB 設計（リポジトリ） | [`docs/DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) |
| PRD（Notion） | [要求仕様書 (PRD)](https://www.notion.so/PRD-34829a9d48118038aaf8d7ee22bbf508?pvs=21) |
| UI 設計（Figma） | （未定） |

---

## 1. 技術概要・方針

### アーキテクチャ方針

- クライアントは **Supabase（Auth + PostgREST + RLS）** を主な BaaS とする。**Rails / Go 等の自前アプリサーバーは置かない**方針で進める。
- **秘密情報を隠した HTTP 処理**（外部 API キー、Webhook 受信、軽いサーバー側オーケストレーション）が必要になった場合は **Supabase Edge Functions**（Deno 上の TypeScript）で補う。用途・URL・認証の詳細は [`docs/API_DESIGN.md`](./API_DESIGN.md) に集約する。

### 技術スタック

#### フロントエンド

| 技術 | 用途 |
| --- | --- |
| React Native | iOS / Android 対応のモバイルアプリ開発 |
| Expo | 開発環境の簡略化・Push 通知・EAS ビルド |
| TypeScript | 型安全・保守性向上 |

#### バックエンド

| 技術 | 用途 |
| --- | --- |
| Supabase（PostgREST） | 認証済みクライアントからの CRUD・RLS 前提のデータアクセス |
| Supabase Edge Functions | 上記だけでは危険／不十分な処理（例: **F-13** 為替 API のプロキシとキャッシュ、**F-10** のサーバー起点通知が必要になった場合の補助、Webhook）。Deno + TypeScript |

#### DB

| 技術 | 用途 |
| --- | --- |
| PostgreSQL | Supabase 内蔵。ユーザーデータ・サブスク情報の永続化 |

#### インフラ

| 技術 | 用途 |
| --- | --- |
| Docker | Supabase のローカル開発環境の統一（Supabase CLI が Docker 前提） |
| Supabase CLI | ローカルで Supabase を起動・マイグレーション管理 |

### フロントエンド（Expo）— クリーンアーキテクチャ

**モバイルアプリ（Expo）はクリーンアーキテクチャの考え方で構成する**（依存は常に**内側へ**：UI やインフラはドメイン・ユースケースに依存し、逆はない）。

| 層 | 責務 | 例（SubTrack） |
| --- | --- | --- |
| **domain** | ビジネスルール・純粋関数・型。React / Supabase に依存しない | 月額換算、`paused` を合計から除外、入力値の妥当性 |
| **application** | ユースケース（1 操作の流れ）。ポートのみに依存 | 「プリセットから登録」「今日使ったを記録」「ダッシュボード用集計の実行」 |
| **ports** | ユースケースが必要とする抽象（インターフェース） | `SubscriptionRepository`、`AuthSessionPort`、`FxRatePort` |
| **infrastructure** | ポートの実装。外部 I/O | Supabase クライアント、`fetch` で Edge Functions、AsyncStorage 等 |
| **presentation** | 画面・フック・expo-router | `app/` のルートは薄く、表示と入力、ユースケース呼び出し |

**ディレクトリの目安**（導入時に `src/` 等で名前を揃える。既存の `app/` はルート中心でよい）:

- `domain/` … エンティティ・値オブジェクト・ドメイン関数
- `application/` … ユースケース（1 ファイル 1 流れ程度）
- `ports/` … リポジトリ・サービスインターフェース
- `infrastructure/` … `supabase/` 等のアダプタ、DTO ↔ domain のマッパー
- `app/`（または `presentation/`）… UI・ルーティング

**サーバー側**: Postgres の RLS・ビュー・SQL 関数は引き続き「サーバー上のドメイン境界」として使う。Edge Functions は **infrastructure の延長**（`docs/API_DESIGN.md`）。

**段階的導入**: ルールが薄い CRUD ・単一トグルの保存だけは **画面近くに簡略実装してよい**。**分岐・金額・通知条件が増える処理から**層を分ける。新規の複雑な機能は **原則クリーンの層に沿う**。

### 特記事項

- **Push 通知（F-10 など）**: **`expo-notifications`** を利用する。**Expo Go では Push の検証が限定的**なため、実機での本番相当の挙動確認は **EAS Build**（development / preview ビルド）を前提とする。更新日リマインドのローカル検証は、同 API の**スケジュール通知**で代替可能。FCM / APNs のクレデンシャルは **EAS プロジェクト**側で管理し、アプリに秘密を埋め込まない。**ユーザーがアプリを開かない日でもサーバーから確実に送る**要件が固まった場合は、**Edge Function + スケジュール等**の併用を `docs/API_DESIGN.md` で設計する。
- **Edge Functions**: **常時必須ではない。** 採用時は `supabase/functions/` をリポジトリで管理し、**エンドポイント仕様・認証方針を `docs/API_DESIGN.md` に追記**する。ローカルは `supabase functions serve`、デプロイは `supabase functions deploy`（[公式: Edge Functions](https://supabase.com/docs/guides/functions)）。

### ローカル開発（Supabase CLI・マイグレーション）

**Supabase ダッシュボードの Table Editor 等でのスキーマ変更は原則禁止**（本番・Staging に限らず、チームで再現できる形を最優先）。詳細・例外は [`docs/Rule.md`](./Rule.md) の「データベーススキーマ（Supabase）」。

作業コマンドの手元手順は [`README.md`](../README.md) を正とする。ここでは方針のみ。

1. `supabase start` でローカルスタックを起動（Docker 必須）。
2. スキーマ変更は **`supabase/migrations/*.sql`** にのみ加え、**`docs/DATABASE_DESIGN.md`** と意図が食い違わないようにする。
3. 変更の検証は `supabase db reset`（ローカル DB をマイグレーションから再構築）で行う。
4. 本番・Staging への適用フロー（`db push` / CI / 手動）はプロジェクト運用が固まり次第、本節に追記する。

---

## 2. システムアーキテクチャ

> コンポーネント間の関係・データの流れを記述する。

```
[Expo アプリ] ── JWT ──▶ [Supabase Auth + PostgREST + RLS] ──▶ [PostgreSQL]
      │                          ▲
      │    （秘密が要るHTTP・Webhook・スケジュール処理）
      └──────────────────────────┘──▶ [Edge Functions] ──▶ 外部 API 等
```

※ データの正は引き続き **Postgres + マイグレーション**。Edge Functions は「DBをGUIで触る」代替ではない（[`docs/Rule.md`](./Rule.md)）。

---

## 3. API 設計

**リポジトリ上の正:** [`docs/API_DESIGN.md`](./API_DESIGN.md)。**PostgREST** と**採用する Edge Functions** の URL・契約をここに書く（現状はプレースホルダ含む）。

補助: [API 設計（Notion）](https://www.notion.so/API-34829a9d481180528847f32d2552d630?pvs=21)

---

## 4. データベース設計

**リポジトリ上の正:** [`docs/DATABASE_DESIGN.md`](./DATABASE_DESIGN.md)（スキーマ草案）。**実装の正**は `supabase/migrations/`。変更時は両方を同期する。**スキーマの変更は Supabase UI 上のエディタでは行わず**、マイグレーションと PR で行う（原則・例外は [`docs/Rule.md`](./Rule.md)）。

補助: [DB 設計（Notion）](https://www.notion.so/DB-34829a9d481180af930cff32915c3126?pvs=21)

---

## 5. 処理フロー・シーケンス

> 主要な処理の流れを記述する。

```
（例）
1. ユーザーがボタンをクリック
2. フロントエンドが POST /api/v1/xxx を呼び出す
3. バックエンドがバリデーション
4. DB に保存
5. レスポンスを返す
6. フロントエンドが画面を更新
```

---

## 6. 画面・フロントエンド仕様

> UI の振る舞い・バリデーション等を記述する。Figma と合わせて参照すること。

**機能単位の仕様（前提・完了条件・エラー・ビジネスルール）**は [`docs/FEATURE_REQUIREMENTS.md`](./FEATURE_REQUIREMENTS.md) を参照する。本節は共通パターンの例・補足とする。

### バリデーション

| 項目 | ルール | エラーメッセージ |
| --- | --- | --- |
| メールアドレス | 形式チェック | 「正しいメールアドレスを入力してください」 |
| （未定） |  |  |

### 状態管理

| 状態 | 説明 | UI 上の表示 |
| --- | --- | --- |
| loading | API 通信中 | スピナー表示 |
| error | エラー発生時 | エラーメッセージ表示 |
| success | 正常完了 | 完了メッセージ表示 |

---

## 7. 非機能要件・技術的制約

> 未記入。数値・方針が決まったら追記する。

### パフォーマンス

- 目標レスポンスタイム：（未定）
- 想定リクエスト数：（未定）
- 大量データ時ページネーション等：（未定）

### セキュリティ

- 認証・認可方式：（未定）
- 入力値サニタイズ：（未定）
- その他：（未定）

### 可用性・運用

- エラー時のリトライ：（未定）
- ロールバック方針：（未定）
- ログ出力方針：（未定）

---

## 8. 移行・データ対応

> 既存データへの影響・マイグレーション方針を記述する。

- **既存データへの影響**：（未定）
- **マイグレーション方針**：（未定）
- **ロールバック手順**：（未定）

---

## 9. テスト方針

| テスト種別 | 対象 | 担当 |
| --- | --- | --- |
| 単体テスト | ○○ロジック | エンジニア |
| 結合テスト | API〜DB | エンジニア |
| E2E テスト | 主要ユースケース | QA |

（対象・担当はプロジェクトに合わせて具体化する。）

---

## 10. 未解決事項・TODO

| 内容 | 担当 | 期限 |
| --- | --- | --- |
| （未定） |  |  |
