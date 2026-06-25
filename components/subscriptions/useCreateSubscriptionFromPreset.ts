import { useCallback, useRef, useState } from 'react';

import { useInvalidateSubscriptions } from '@/components/subscriptions/SubscriptionRefreshProvider';
import {
  createSubscriptionFromPreset,
  type CreateSubscriptionFromPresetParams,
} from '@/src/application/createSubscriptionFromPreset';
import type { Subscription } from '@/src/domain/subscription';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

interface UseCreateSubscriptionFromPresetResult {
  create: (params: CreateSubscriptionFromPresetParams) => Promise<Subscription>;
  isSubmitting: boolean;
}

export function useCreateSubscriptionFromPreset(): UseCreateSubscriptionFromPresetResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const invalidateSubscriptions = useInvalidateSubscriptions();
  // state 反映前の連打による再入（二重 INSERT）を同期的に弾くためのガード。
  const submittingRef = useRef(false);

  const create = useCallback(async (params: CreateSubscriptionFromPresetParams) => {
    if (submittingRef.current) {
      throw new Error('submission already in progress');
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const subscription = await createSubscriptionFromPreset(subscriptionRepositorySupabase, params);
      invalidateSubscriptions();
      return subscription;
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [invalidateSubscriptions]);

  return { create, isSubmitting };
}
