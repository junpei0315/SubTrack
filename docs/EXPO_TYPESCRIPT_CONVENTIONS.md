# Expo / TypeScript の命名・スタイル（目安）

モバイルクライアント（本リポジトリルートの Expo アプリ）向けの目安です。

## 命名

- **React コンポーネント**ファイル・コンポーネント名: `PascalCase`（例: `SubscriptionCard.tsx`）
- **画面・ルート**（`app/` 配下）: Expo Router の慣習に従い、ファイル名は原則 **kebab-case**（例: `subscription-detail.tsx`）。プロジェクト内で既存の配置に合わせる
- **変数・関数**: `camelCase`
- **定数**: `SCREAMING_SNAKE_CASE` または読みやすい `camelCase` のどちらか一方に揃える（新規はファイル内で統一）
- **真偽を返す関数**: `is…` / `has…` / `can…` など、意図が名前から分かる接頭辞を付ける
- **カスタムフック**: `use` で始める（例: `useSubscriptions`）

## スタイル

- 同じ処理の重複は関数・コンポーネントに切り出す
- 条件が複雑なときは変数に名前を付けて意図を明示する
- 識別子に**日本語・絵文字は使わない**（[Rule.md](./Rule.md) の禁止事項と同じ）
