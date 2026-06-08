# アーキテクチャ全体図（Architecture Overview）

SubTrack の **システム全体構成**を Mermaid 図で俯瞰するためのドキュメント。
「どのフォルダに何を書くか」の実装ガイドは [`docs/ARCHITECTURE_GUIDE.md`](./ARCHITECTURE_GUIDE.md)、方針の正は [`docs/TRD.md`](./TRD.md) §1 を参照する。

## 関連ドキュメント

| 内容 | パス |
| --- | --- |
| ディレクトリ・層の実装ガイド | [`docs/ARCHITECTURE_GUIDE.md`](./ARCHITECTURE_GUIDE.md) |
| 技術方針（スタック・全体） | [`docs/TRD.md`](./TRD.md) |
| API 設計（PostgREST / Edge Functions） | [`docs/API_DESIGN.md`](./API_DESIGN.md) |
| DB 設計（ER・テーブル） | [`docs/DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) |
| Edge Functions（LINE 連携） | [`supabase/functions/README.md`](../supabase/functions/README.md) |

---

## 1. システム全体構成

クライアント（Expo）、Supabase（BaaS）、外部サービス（LINE）の関係を示す。

```mermaid
flowchart TB
  subgraph Client["クライアント"]
    App["Expo アプリ<br/>(iOS / Android / Web)"]
  end

  subgraph LINEcloud["LINE Platform"]
    LineApp["ユーザーの LINE トーク"]
    LineAPI["LINE Messaging API"]
  end

  subgraph Supabase["Supabase (BaaS)"]
    Auth["Auth<br/>(メール / Google OAuth)"]
    REST["PostgREST<br/>(自動 REST + RLS)"]
    Edge["Edge Functions (Deno)<br/>line-webhook / line-daily-push"]
    DB[("PostgreSQL<br/>subscriptions / usage_logs ほか")]
    Cron["pg_cron<br/>(請求日繰り上げ / 毎日プッシュ)"]
  end

  App -->|"@supabase/supabase-js<br/>JWT + RLS"| Auth
  App -->|"select / insert / rpc"| REST
  REST --> DB
  Auth --> DB

  App -.->|"連携コード発行 (rpc)"| REST
  LineApp -->|"ボタン押下 / コード送信"| LineAPI
  LineAPI -->|"Webhook (署名付き)"| Edge
  Edge -->|"service_role で書込"| DB
  Edge -->|"reply / push"| LineAPI
  LineAPI --> LineApp

  Cron -->|"毎日トリガ"| Edge
  Cron --> DB
```

ポイント:

- アプリは通常のデータ操作を **PostgREST + RLS** 経由で行う（`@supabase/supabase-js`）。
- LINE 連携の書き込みは **Edge Functions が service_role** で行い、署名検証で保護する。
- 定期処理（請求日の繰り上げ・毎日のプッシュ）は **pg_cron**。

---

## 2. フロントエンド（クリーンアーキテクチャ）

Expo アプリ内の依存方向。外側（UI）から内側（domain）へ依存し、**domain は React/Supabase に依存しない**。

```mermaid
flowchart LR
  subgraph Presentation["presentation (app/ + components/)"]
    Screen["画面 (app/(tabs)/...)"]
    Hook["useXxx フック"]
    UI["コンポーネント"]
  end

  subgraph Application["application (ユースケース)"]
    UC["getMonthlyBillingTotal<br/>recordUsage / issueLineLinkCode ..."]
  end

  subgraph Ports["ports (インターフェース)"]
    Port["SubscriptionRepository<br/>UsageLogRepository<br/>LineLinkRepository"]
  end

  subgraph Domain["domain (純粋関数・型)"]
    Dom["billingTotals / money<br/>billingCycle / subscription ..."]
  end

  subgraph Infrastructure["infrastructure (具象)"]
    Infra["*RepositorySupabase<br/>supabase client"]
    Mock["*RepositoryMock"]
  end

  Screen --> Hook --> UC
  UI --> Hook
  UC --> Port
  UC --> Dom
  Infra -. implements .-> Port
  Mock -. implements .-> Port
  Infra --> Dom
  Hook -->|"DI: 具象を注入"| Infra
```

詳細な配置例は [`docs/ARCHITECTURE_GUIDE.md`](./ARCHITECTURE_GUIDE.md)。

---

## 3. 主要データフロー

### 3-1. 今月の請求額表示（F-05）

```mermaid
sequenceDiagram
  participant U as ユーザー
  participant H as useMonthlySpending
  participant UC as getMonthlyBillingTotal
  participant R as subscriptionRepositorySupabase
  participant DB as Supabase DB
  participant D as domain/billingTotals

  U->>H: Home 画面を開く
  H->>UC: 当月の合計を要求
  UC->>R: findAll()
  R->>DB: select subscriptions (+plans/services)
  DB-->>R: rows
  R-->>UC: Subscription[]
  UC->>D: computeMonthlyBillingTotal(subs, year, month)
  D-->>UC: { amount, currency, count }
  UC-->>H: 合計 DTO
  H-->>U: ¥ 合計を表示
```

集計ルール（active のみ・次回請求日が当月）は **domain に閉じている**ため、データソースや金額変動に依存しない。

### 3-2. 利用記録：アプリ経由（F-08）

```mermaid
sequenceDiagram
  participant U as ユーザー
  participant C as UsageFrequencyTracker
  participant UC as recordUsage / removeUsage
  participant R as usageLogRepositorySupabase
  participant DB as Supabase DB

  U->>C: 「使った」をタップ
  C->>UC: recordUsage(today)
  UC->>R: addUsedDate()
  R->>DB: insert usage_logs (RLS: 自分の行)
  Note over DB: UNIQUE(subscription_id, used_date)<br/>で冪等
  DB-->>R: ok
  R-->>C: 完了
```

### 3-3. 利用記録：LINE 経由（F-08 別チャネル）

```mermaid
sequenceDiagram
  participant U as ユーザー
  participant L as LINE トーク
  participant API as LINE Messaging API
  participant W as line-webhook (Edge)
  participant DB as Supabase DB

  U->>L: 「使った / 使ってない」を押す
  L->>API: postback
  API->>W: Webhook (X-Line-Signature)
  W->>W: 署名検証
  W->>DB: line_links から user_id 解決
  W->>DB: 自分のサブスクか確認 → usage_logs upsert/delete
  W->>API: reply（無料の応答メッセージ）
  API-->>U: 「記録しました」
```

### 3-4. 毎日のプッシュ（cron → LINE）

```mermaid
sequenceDiagram
  participant Cron as pg_cron (毎朝)
  participant P as line-daily-push (Edge)
  participant DB as Supabase DB
  participant API as LINE Messaging API
  participant U as ユーザーの LINE

  Cron->>P: HTTP POST (CRON_SECRET)
  P->>DB: line_links 一覧
  loop 連携ユーザーごと
    P->>DB: active サブスク取得
    P->>API: push（1 通に Flex カルーセル）
    API-->>U: 「今日使った？」ボタン
  end
```

---

## 4. アカウント連携（LINE）

アプリでワンタイムコードを発行し、ユーザーが LINE に送ることで連携を確立する。

```mermaid
flowchart LR
  A["アプリ: 連携コード発行<br/>rpc create_line_link_code()"] --> B[("line_link_codes<br/>(6桁・10分有効)")]
  C["ユーザー: LINE にコード送信"] --> D["line-webhook"]
  D -->|"コード照合"| B
  D -->|"一致 → 紐付け作成"| E[("line_links<br/>user_id ↔ line_user_id")]
  D -->|"使用済みコード削除"| B
```

セキュリティ:

- `line_link_codes` は一般ユーザーから直接アクセス不可（RLS でポリシー無し）。発行は `SECURITY DEFINER` の RPC。
- 照合・連携確定・利用記録の書き込みは **Edge Functions の service_role** のみ。
- `service_role` キー・LINE トークンは **Edge の secrets** に保管し、クライアントへ出さない。

---

## 5. 環境・デプロイ

```mermaid
flowchart LR
  subgraph Local["ローカル / 開発者"]
    Code["リポジトリ<br/>app/ src/ supabase/"]
  end

  subgraph CI["GitHub"]
    GH["CI: lint / typecheck"]
  end

  subgraph SB["Supabase プロジェクト"]
    Mig["DB マイグレーション"]
    Fn["Edge Functions"]
    Sec["secrets"]
  end

  Code -->|"git push / PR"| GH
  Code -->|"supabase db push"| Mig
  Code -->|"supabase functions deploy"| Fn
  Code -->|"supabase secrets set"| Sec
```

| 対象 | 反映コマンド | 補足 |
| --- | --- | --- |
| DB スキーマ | `supabase db push` | 変更は `supabase/migrations/` のみ（UI 直編集禁止） |
| Edge Functions | `supabase functions deploy <name>` | 何度でも上書き可。実行回数で課金（無料枠あり） |
| シークレット | `supabase secrets set` | 再デプロイで消えない |
| アプリ | Expo（EAS / ストア配布） | クラウド関数とは別系統 |

---

## 変更履歴

| 日付 | 内容 |
| ---- | ---- |
| 2026-06-06 | 初版（システム全体・クリーン層・主要フロー・LINE 連携・デプロイ） |
