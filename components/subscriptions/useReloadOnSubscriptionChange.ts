import { useEffect, useRef } from 'react';

import { useSubscriptionRefreshVersion } from '@/components/subscriptions/SubscriptionRefreshProvider';

/**
 * サブスクの追加・変更・削除後に、各画面のデータ取得を再実行する。
 */
export function useReloadOnSubscriptionChange(reload: () => void | Promise<void>): void {
  const version = useSubscriptionRefreshVersion();
  const prevVersionRef = useRef(version);

  useEffect(() => {
    if (prevVersionRef.current === version) {
      return;
    }
    prevVersionRef.current = version;
    void reload();
  }, [version, reload]);
}
