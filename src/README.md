# `src/`（クリーンアーキテクチャ用）

Expo Router の画面はルートの **`app/`** に置き、**ドメイン〜インフラのコードはここに集約**する想定。

- **方針の正**: [`docs/TRD.md`](../docs/TRD.md) §1「フロントエンド（Expo）— クリーンアーキテクチャ」
- **リポジトリ全体のディレクトリ・`components` / `hooks`（採用済み）**: [`docs/ARCHITECTURE_GUIDE.md`](../docs/ARCHITECTURE_GUIDE.md)

| ディレクトリ      | 役割                                              |
| ----------------- | ------------------------------------------------- |
| `domain/`         | ルール・純粋関数。React / Supabase 非依存         |
| `application/`    | ユースケース                                      |
| `ports/`          | リポジトリ等のインターフェース                    |
| `infrastructure/` | Supabase 等の具象（`supabase/` サブディレクトリ） |

各層には現状 **`index.ts` のプレースホルダ**のみ（`export {}`）。実装追加時にモジュールを分割する。

TypeScript の import は既存の `tsconfig.json` の `@/*` により、`@/src/domain/foo` のように指定できる。
