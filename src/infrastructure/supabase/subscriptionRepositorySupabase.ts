import { formatLocalDate } from '@/src/domain/localDate';
import type { Subscription } from '@/src/domain/subscription';
import type { CreateSubscriptionInput, SubscriptionRepository } from '@/src/ports/subscriptionRepository';

import { supabase } from './client';
import { mapSubscriptionRow, SUBSCRIPTION_SELECT } from './subscriptionMapper';

export const subscriptionRepositorySupabase: SubscriptionRepository = {
  async findAll(): Promise<Subscription[]> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(SUBSCRIPTION_SELECT)
      .order('next_billing_date', { ascending: true });

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapSubscriptionRow(row as Record<string, unknown>));
  },

  async findById(id: string): Promise<Subscription | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select(SUBSCRIPTION_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return mapSubscriptionRow(data as Record<string, unknown>);
  },

  async findByBillingMonth(year: number, month: number): Promise<Subscription[]> {
    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('subscriptions')
      .select(SUBSCRIPTION_SELECT)
      .gte('next_billing_date', monthStart)
      .lte('next_billing_date', monthEnd)
      .eq('status', 'active');

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapSubscriptionRow(row as Record<string, unknown>));
  },

  async create(input: CreateSubscriptionInput): Promise<Subscription> {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: input.userId,
        plan_id: input.planId,
        start_date: formatLocalDate(input.startDate),
        next_billing_date: formatLocalDate(input.nextBillingDate),
        status: 'active',
        custom_price: input.customPrice ?? null,
      })
      .select(SUBSCRIPTION_SELECT)
      .single();

    if (error) {
      throw error;
    }

    return mapSubscriptionRow(data as Record<string, unknown>);
  },

  async createMany(inputs: CreateSubscriptionInput[]): Promise<Subscription[]> {
    if (inputs.length === 0) {
      return [];
    }

    const rows = inputs.map((input) => ({
      user_id: input.userId,
      plan_id: input.planId,
      start_date: formatLocalDate(input.startDate),
      next_billing_date: formatLocalDate(input.nextBillingDate),
      status: 'active',
      custom_price: input.customPrice ?? null,
    }));

    const { data, error } = await supabase
      .from('subscriptions')
      .insert(rows)
      .select(SUBSCRIPTION_SELECT);

    if (error) {
      throw error;
    }

    return (data ?? []).map((row) => mapSubscriptionRow(row as Record<string, unknown>));
  },
};
