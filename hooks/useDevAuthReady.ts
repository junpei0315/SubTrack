import { useEffect, useState } from 'react';

import {
  ensureDevSession,
  isDevAutoSignInEnabled,
} from '@/src/infrastructure/supabase/ensureDevSession';

export function useDevAuthReady(): boolean {
  const [isReady, setIsReady] = useState(() => !isDevAutoSignInEnabled());

  useEffect(() => {
    if (!isDevAutoSignInEnabled()) {
      return;
    }

    let isMounted = true;

    void ensureDevSession()
      .catch((error: unknown) => {
        console.error('[useDevAuthReady] dev auto sign-in failed', error);
      })
      .finally(() => {
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
