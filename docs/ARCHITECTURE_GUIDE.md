# アプリのアーキテクチャガイド（ディレクトリと具体例）

**目的**: 「どのフォルダに何を書くか」を**具体例つき**で一望できるようにする。

- **方針の正（ルール）**: [`docs/TRD.md`](./TRD.md) §1「フロントエンド（Expo）— クリーンアーキテクチャ」
- **本書**: 読み手向けの**ガイド・例**。実装追加時は TRD と矛盾しないように更新する。

**採用方針（確定）**: リポジトリ全体のディレクトリ構成・`components` / `hooks` の役割・**UI と処理の分け方（コンポーネント + `useXxx`）**は、**本書に従う**。クリーンの層（domain 〜 infrastructure）の定義は [`docs/TRD.md`](./TRD.md) §1 と一致させる。

---

## 推奨ディレクトリ構成（リポジトリ全体）

```text
SubTrack/
├── app/                          # expo-router：ルート定義。画面は薄く（レイアウト・ナビ・イベント委譲）
│   _layout.tsx
│   modal.tsx
│   (auth)/                       # 未認証フロー（必要になったら追加）
│   (tabs)/
│       _layout.tsx
│       index.tsx
│       subscriptions/            # 例：一覧・詳細（画面が増えたら）
│           index.tsx
│           [id].tsx
│       settings/
│           index.tsx
├── src/                          # クリーン寄り：ドメイン〜インフラ
│   domain/
│   application/
│   ports/
│   infrastructure/
│       supabase/
├── components/                   # 汎用・横断 UI（原則ダム寄り）
│   ui/                           # 小さな部品
│   # 機能に寄った塊は components/<feature>/（例: subscriptions/）
├── hooks/                        # アプリ全体の presentation 用 hook（テーマ等。テンプレ由来）
├── constants/
├── docs/
├── supabase/
│   migrations/
├── scripts/
└── …
```

- **`app/`** の `(auth)` / `subscriptions/` 等は、**まだ無くてよい**。機能追加に合わせて増やす。
- **`src/presentation/`** は、共通 hook や画面専用部品が `components/` に溢れたら**後から切り出す**選択でよい（初期は必須としない）。

---

## components / hooks の扱い

| 場所                       | 役割                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`components/`**          | 見た目の部品。**汎用はダム**（props のみ）。振る舞いが載る場合は **同隣の `useXxx.ts`**（コンポーネント + フック）に分ける。**DB 呼び出しは書かず**、`src/application` を呼ぶ配線に留める。 |
| **`hooks/`**               | **全画面共通**の軽い hook（カラースキーム・テーマなど）。**機能専用**は `components/<機能名>/useYyy.ts` に寄せやすい。                                                                      |
| **コンテナ／プレゼン分割** | **1 画面が太いときだけ** `XxxView` + `XxxContainer` のように明示分割してよい。日々は **コンポーネント + `useXxx`** で足りることが多い。                                                     |

---

## 層ごとに「何を書くか」（再掲）

| 層                 | ここに書く                                                      | ここに書かない                                 |
| ------------------ | --------------------------------------------------------------- | ---------------------------------------------- |
| **domain**         | 金額換算、`paused` を合計から除外、日付・入力の検証、ドメイン型 | `useState`、`createClient`、`fetch`            |
| **application**    | 「1 ボタン 1 操作」の流れ（取得 →domain で加工 → 保存）         | Supabase の `.from()` 直書き                   |
| **ports**          | `interface SubscriptionRepository { ... }` など抽象だけ         | 実装                                           |
| **infrastructure** | `@supabase/supabase-js` の呼び出し、行データ ↔ domain の変換    | 画面用の色・ナビ                               |
| **app/**           | ルート、UI、ユーザ操作をユースケースに渡す                      | 長い if のビジネス分岐（domain / use case へ） |

**import の例**（`tsconfig` の `@/*`）:

```ts
import type { Subscription } from '@/src/domain/subscription';
import { recordUsageToday } from '@/src/application/recordUsageToday';
```

（実際のファイル名は機能に合わせて増やす。）

---

## トレードオフ（把握しておくこと）

- ファイル数・レビューで「どこに書くか」を揃えるコストはあるが、**致命的な理由で本構成をやめる必要はないという認識で採用する**。**段階的導入**（薄い画面は簡略、`src` は太い機能から）で負荷を抑える。

---

## 具体例 1: 「今日使った」（F-08）

**流れ**: 画面タップ → ユースケース → リポジトリが `usage_logs` に insert。

| 置き場所       | ファイル例（命名は一例）                                    | 中身のイメージ                                                           |
| -------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------ |
| ports          | `src/ports/usageLogRepository.ts`                           | `saveForToday(userId, subscriptionId, localDate): Promise<void>`         |
| infrastructure | `src/infrastructure/supabase/usageLogRepositorySupabase.ts` | `insert` / ユニーク制約エラーをアプリ用エラーに変換                      |
| domain         | `src/domain/usageDate.ts`                                   | 「今日」の日付を端末タイムゾーンで決める純粋関数（または引数で受け取る） |
| application    | `src/application/recordUsageToday.ts`                       | 日付取得 → `ports` の `save` を呼ぶだけ                                  |
| app            | `app/(tabs)/index.tsx` や専用コンポーネント                 | ボタン `onPress` で `recordUsageToday(...)` を await、トーストはここ     |

**書かない例**: `app/**/*.tsx` の中で `supabase.from('usage_logs').insert(...)` をベタ書き（**原則 infra に閉じる**）。

---

## 具体例 2: 月額合計の表示（F-05）

**流れ**: 一覧取得 → domain で「`active` のみ」「年額 ÷12」等を反映した合計 → 画面に渡す。

| 置き場所       | ファイル例                                                      | 中身のイメージ                                                       |
| -------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| domain         | `src/domain/subscriptionTotals.ts`                              | `computeMonthlyTotal(rows): number`（`paused` 除外、周期ごとの換算） |
| ports          | `src/ports/subscriptionRepository.ts`                           | ダッシュボード用の一覧取得メソッド                                   |
| infrastructure | `src/infrastructure/supabase/subscriptionRepositorySupabase.ts` | join 込みの select、マッパーで domain 型へ                           |
| application    | `src/application/getMonthlyDashboard.ts`                        | 取得 → `computeMonthlyTotal` → 結果 DTO                              |
| app            | `app/(tabs)/index.tsx`                                          | フック `useMonthlyDashboard` がユースケースを呼び、表示だけ          |

**別案**: 集計を **Postgres のビュー / SQL 関数**に寄せる場合、リポジトリは「ビューを読む」だけになり、**金額ルールの説明は DB 側にもコメント or 設計書**に残す。

---

## 具体例 3: 為替（F-13）で Edge Functions を使う場合

| 置き場所                       | 役割                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------- |
| `supabase/functions/fx_rates/` | 外部 API を叩き、キーを隠す（仕様は [`docs/API_DESIGN.md`](./API_DESIGN.md)） |
| ports                          | `FxRatePort`（`getRates(baseCurrency)` など）                                 |
| infrastructure                 | `fxRateClientEdge.ts` が `fetch(functions/v1/fx_rates)`                       |

ドメインは **「換算後の金額を計算する」純粋関数**だけ持ち、HTTP は infra だけ。

---

## DB まわり（アプリと別）

| 書く場所                                          | 内容                        |
| ------------------------------------------------- | --------------------------- |
| [`docs/DATABASE_DESIGN.md`](./DATABASE_DESIGN.md) | テーブル・列の意味          |
| `supabase/migrations/*.sql`                       | 実行可能 DDL / RLS / policy |
| [`docs/MIGRATIONS.md`](./MIGRATIONS.md)           | 追加・検証・PR の手順       |

アプリの `infrastructure` は **マイグレーション済みスキーマ**を前提に書く。

---

## 段階的導入の扱い

- **設定の 1 トグル即保存**など極薄い処理は、**一時的に** `app/` 近くに書いてもよい（[`docs/TRD.md`](./TRD.md) §1 に従う）。
- **分岐・金額・状態が増えたら**、該当ロジックを `domain` / `application` に切り出す。

---

## 変更履歴

| 日付       | 内容                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------- |
| 2026-05-15 | リポジトリ全体の推奨ツリー、`components` / `hooks`、トレードオフ、**採用方針（確定）**を追記 |
| 2026-05-15 | 初版                                                                                         |
