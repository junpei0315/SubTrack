import { useCallback, useState } from 'react';

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

  const create = useCallback(async (params: CreateSubscriptionFromPresetParams) => {
    setIsSubmitting(true);
    try {
      return await createSubscriptionFromPreset(subscriptionRepositorySupabase, params);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { create, isSubmitting };
}
