import type { LineLinkRepository } from '@/src/ports/lineLinkRepository';

import { supabase } from './client';

export const lineLinkRepositorySupabase: LineLinkRepository = {
  async issueLinkCode(): Promise<string> {
    const { data, error } = await supabase.rpc('create_line_link_code');

    if (error) {
      throw error;
    }

    return data as string;
  },

  async isLinked(): Promise<boolean> {
    const { count, error } = await supabase
      .from('line_links')
      .select('user_id', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return (count ?? 0) > 0;
  },

  async unlink(): Promise<void> {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw userError;
    }

    const userId = userData.user?.id;
    if (!userId) {
      return;
    }

    const { error } = await supabase.from('line_links').delete().eq('user_id', userId);
    if (error) {
      throw error;
    }
  },
};
