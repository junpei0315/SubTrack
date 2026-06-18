import { useCallback, useRef, useState } from 'react';

import {
  createSubscriptionsFromPresets,
  type PresetSelectionInput,
} from '@/src/application/createSubscriptionsFromPresets';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

interface UseOnboardingRegisterResult {
  /** 選択したプリセットを一括登録する。登録後はサブスクが 1 件以上になる。 */
  register: (userId: string, selections: PresetSelectionInput[]) => Promise<void>;
  isSubmitting: boolean;
}

export function useOnboardingRegister(): UseOnboardingRegisterResult {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // state 反映前の連打による二重送信を同期的に弾く。
  const submittingRef = useRef(false);

  const register = useCallback(async (userId: string, selections: PresetSelectionInput[]) => {
    if (submittingRef.current) {
      throw new Error('submission already in progress');
    }
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      await createSubscriptionsFromPresets(subscriptionRepositorySupabase, userId, selections);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }, []);

  return { register, isSubmitting };
}
