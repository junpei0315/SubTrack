import { useEffect, useState } from 'react';

import { ensureDevSession, isDevAutoSignInEnabled } from '@/src/infrastructure/supabase/ensureDevSession';

/**
 * 開発時のみ seed ユーザーでサインインしてから画面を描画する。
 */
export function useDevAuthReady(): boolean {
  const [isReady, setIsReady] = useState(!isDevAutoSignInEnabled());

  useEffect(() => {
    if (!isDevAutoSignInEnabled()) {
      return;
    }

    let isMounted = true;

    void ensureDevSession().finally(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return isReady;
}
