import { formatLocalDate } from '@/src/domain/localDate';
import type {
  CreateCustomSubscriptionInput,
  CustomSubscriptionRepository,
} from '@/src/ports/customSubscriptionRepository';

import { supabase } from './client';

export const customSubscriptionRepositorySupabase: CustomSubscriptionRepository = {
  async create(input: CreateCustomSubscriptionInput): Promise<string> {
    const { data, error } = await supabase.rpc('create_custom_subscription', {
      p_service_name: input.serviceName,
      p_plan_name: input.planName,
      p_price: input.price,
      p_cycle: input.cycle,
      p_start_date: formatLocalDate(input.startDate),
      p_currency: input.currency ?? 'JPY',
    });

    if (error) {
      if (error.message.includes('duplicate service name')) {
        throw new Error('DUPLICATE_SERVICE');
      }
      throw error;
    }

    if (typeof data !== 'string') {
      throw new Error('create_custom_subscription returned invalid id');
    }

    return data;
  },
};
