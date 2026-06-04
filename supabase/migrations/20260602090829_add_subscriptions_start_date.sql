-- ============================================================================
-- SUBSCRIPTIONS.start_date カラム追加
-- 目的: 契約の最初の請求日（不変）を保持する。
--       UI（請求情報コンポーネント）の「開始日」表示および
--       F-09（利用頻度・1 回あたりコスト）計算で利用する。
-- 補足: next_billing_date は通知バッチ（F-10）用の検索インデックスとして残す。
-- ============================================================================

-- 既存行があっても安全に追加できるよう、一旦 NULL 許容で追加し、
-- next_billing_date を初期値として埋めたあと NOT NULL に変更する。
ALTER TABLE SUBSCRIPTIONS
    ADD COLUMN start_date DATE;

UPDATE SUBSCRIPTIONS
SET start_date = next_billing_date
WHERE start_date IS NULL;

ALTER TABLE SUBSCRIPTIONS
    ALTER COLUMN start_date SET NOT NULL;
