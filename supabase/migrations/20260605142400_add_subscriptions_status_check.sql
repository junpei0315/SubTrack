-- ============================================================================
-- SUBSCRIPTIONS.status に CHECK 制約を追加
-- 目的: ステータスとして許可する値を 'active' / 'paused' / 'cancelled' の
--       3 種類に限定する。これにより「解約（cancelled）」を DB レベルで
--       正式な値として認め、フロント側の型定義（src/domain/subscription.ts）
--       と意味を一致させる。
-- 補足: status はこれまで VARCHAR で値の制限がなく、任意の文字列を保存できた。
--       想定外の値（タイプミス等）の混入を防ぐためにここで制約を加える。
-- ============================================================================

ALTER TABLE subscriptions
    ADD CONSTRAINT subscriptions_status_check
    CHECK (status IN ('active', 'paused', 'cancelled'));
