import { useCallback, useRef, useState } from 'react';

import { useInvalidateSubscriptions } from '@/components/subscriptions/SubscriptionRefreshProvider';
import {
  createCustomSubscription,
  type CreateCustomSubscriptionParams,
} from '@/src/application/createCustomSubscription';
import type { Subscription } from '@/src/domain/subscription';
import { customSubscriptionRepositorySupabase } from '@/src/infrastructure/supabase/customSubscriptionRepositorySupabase';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

interface UseCreateCustomSubscriptionResult {
  create: (params: CreateCustomSubscriptionParams) => Promise<Subscription>;
  isSubmitting: boolean;
}

export function useCreateCustomSubscription(): UseCreateCustomSubscriptionResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const invalidateSubscriptions = useInvalidateSubscriptions();
  const submittingRef = useRef(false);

  const create = useCallback(async (params: CreateCustomSubscriptionParams) => {
    if (submittingRef.current) {
      throw new Error('submission already in progress');
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const subscription = await createCustomSubscription(
        customSubscriptionRepositorySupabase,
        subscriptionRepositorySupabase,
        params
      );
      invalidateSubscriptions();
      return subscription;
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [invalidateSubscriptions]);

  return { create, isSubmitting };
}
