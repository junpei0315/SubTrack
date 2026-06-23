# Supabase Edge Functions

LINE 連携用の Edge Function 群（Deno）。利用実績（`usage_logs`）を「アプリを開かずに」記録するための受け口と定期プッシュを提供する。

| 関数 | 役割 | `verify_jwt` |
| --- | --- | --- |
| `line-webhook` | LINE の Webhook 受け口。連携コード照合 / postback での利用記録 | **false**（署名で保護） |
| `line-daily-push` | 連携済みユーザーへ毎日「使った/使ってない」ボタンを送信 | false（`CRON_SECRET` で保護） |
| `fx-rates` | 為替レート取得（Frankfurter プロキシ・1 日キャッシュ）。F-13 の JPY 換算に使用 | **true** |

`_shared/` は共有ユーティリティ（署名検証・LINE API・service_role クライアント）。

## 必要なシークレット

```bash
supabase secrets set LINE_CHANNEL_SECRET=xxxx
supabase secrets set LINE_CHANNEL_ACCESS_TOKEN=xxxx
# 任意: 定期プッシュの簡易認証用
supabase secrets set CRON_SECRET=xxxx
```

`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` は Supabase が自動注入するため設定不要。

## ローカル開発

```bash
supabase functions serve line-webhook --no-verify-jwt
```

## デプロイ

```bash
supabase functions deploy line-webhook --no-verify-jwt
supabase functions deploy line-daily-push --no-verify-jwt
supabase functions deploy fx-rates
```

LINE Developers コンソールで Webhook URL に
`https://<project-ref>.functions.supabase.co/line-webhook` を登録し、Webhook を有効化する。

## 定期実行（毎日のプッシュ）

`line-daily-push` を 1 日 1 回呼ぶ。例（pg_cron + pg_net、毎朝 9:00 JST = 0:00 UTC）:

```sql
select cron.schedule(
  'line-daily-push',
  '0 0 * * *',
  $$
  select net.http_post(
    url := 'https://<project-ref>.functions.supabase.co/line-daily-push',
    headers := jsonb_build_object('Authorization', 'Bearer <CRON_SECRET>')
  );
  $$
);
```

外部スケジューラ（GitHub Actions の cron 等）から HTTP POST しても良い。
