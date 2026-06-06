import { useCallback, useEffect, useState } from 'react';

import { getSubscriptions } from '@/src/application/getSubscriptions';
import type { Subscription } from '@/src/domain/subscription';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

interface UseSubscriptionListResult {
  subscriptions: Subscription[];
  isLoading: boolean;
  errorMessage: string | null;
  reload: () => Promise<void>;
}

export function useSubscriptionList(): UseSubscriptionListResult {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await getSubscriptions(subscriptionRepositorySupabase);
      setSubscriptions(result);
    } catch {
      setErrorMessage('サブスクの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    subscriptions,
    isLoading,
    errorMessage,
    reload: load,
  };
}
