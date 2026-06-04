import type {
  AddUsedDateParams,
  RemoveUsedDateParams,
  UsageLogRepository,
} from '@/src/ports/usageLogRepository';

import { supabase } from './client';

// 同日二重記録防止のユニーク制約 (subscription_id, used_date) 違反コード
const UNIQUE_VIOLATION = '23505';

export const usageLogRepositorySupabase: UsageLogRepository = {
  async listUsedDatesBySubscription(subscriptionId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('usage_logs')
      .select('used_date')
      .eq('subscription_id', subscriptionId)
      .order('used_date', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => (row as { used_date: string }).used_date);
  },

  async addUsedDate({ userId, subscriptionId, usedDate }: AddUsedDateParams): Promise<void> {
    const { error } = await supabase.from('usage_logs').insert({
      user_id: userId,
      subscription_id: subscriptionId,
      used_date: usedDate,
    });

    // 同日に既に記録済みなら成功扱い（冪等）
    if (error && error.code !== UNIQUE_VIOLATION) {
      throw error;
    }
  },

  async removeUsedDate({ subscriptionId, usedDate }: RemoveUsedDateParams): Promise<void> {
    const { error } = await supabase
      .from('usage_logs')
      .delete()
      .eq('subscription_id', subscriptionId)
      .eq('used_date', usedDate);

    if (error) {
      throw error;
    }
  },
};
