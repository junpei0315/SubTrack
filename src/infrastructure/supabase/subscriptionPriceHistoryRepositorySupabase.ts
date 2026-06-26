import { formatLocalDate, parseLocalDate } from '@/src/domain/localDate';
import type { SubscriptionPriceEntry } from '@/src/domain/subscriptionPriceHistory';
import type {
  SubscriptionPriceHistoryRepository,
  UpsertSubscriptionPriceEntryInput,
} from '@/src/ports/subscriptionPriceHistoryRepository';

import { supabase } from './client';

function mapRow(row: Record<string, unknown>): SubscriptionPriceEntry {
  return {
    subscriptionId: String(row.subscription_id),
    effectiveFrom: parseLocalDate(String(row.effective_from)),
    price: Number(row.price),
  };
}

export const subscriptionPriceHistoryRepositorySupabase: SubscriptionPriceHistoryRepository = {
  async listByUserId(userId: string): Promise<SubscriptionPriceEntry[]> {
    const { data, error } = await supabase
      .from('subscription_price_history')
      .select('subscription_id, effective_from, price')
      .eq('user_id', userId)
      .order('effective_from', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  },

  async upsertEntry(input: UpsertSubscriptionPriceEntryInput): Promise<void> {
    const { error } = await supabase.from('subscription_price_history').upsert(
      {
        subscription_id: input.subscriptionId,
        user_id: input.userId,
        price: input.price,
        effective_from: formatLocalDate(input.effectiveFrom),
      },
      { onConflict: 'subscription_id,effective_from' }
    );

    if (error) {
      throw error;
    }
  },

  async deleteBySubscriptionId(subscriptionId: string): Promise<void> {
    const { error } = await supabase
      .from('subscription_price_history')
      .delete()
      .eq('subscription_id', subscriptionId);

    if (error) {
      throw error;
    }
  },
};
