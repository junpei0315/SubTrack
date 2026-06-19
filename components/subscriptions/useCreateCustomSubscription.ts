import { useCallback, useRef, useState } from 'react';

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
  const submittingRef = useRef(false);

  const create = useCallback(async (params: CreateCustomSubscriptionParams) => {
    if (submittingRef.current) {
      throw new Error('submission already in progress');
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      return await createCustomSubscription(
        customSubscriptionRepositorySupabase,
        subscriptionRepositorySupabase,
        params
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, []);

  return { create, isSubmitting };
}
