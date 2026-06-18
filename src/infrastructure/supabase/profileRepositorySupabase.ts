import type { Profile } from '@/src/domain/profile';
import type { ProfileRepository } from '@/src/ports/profileRepository';

import { supabase } from './client';
import { mapProfileRow, PROFILE_SELECT } from './profileMapper';

export const profileRepositorySupabase: ProfileRepository = {
  async getCurrent(): Promise<Profile | null> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw userError;
    }
    const userId = userData.user?.id;
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }
    if (!data) {
      return null;
    }

    return mapProfileRow(data as Record<string, unknown>);
  },

  async markOnboardingCompleted(): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw userError;
    }
    const userId = userData.user?.id;
    if (!userId) {
      throw new Error('ログインユーザーが特定できませんでした');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  },
};
