import type { BillingCycle } from '@/src/domain/billingCycle';

export interface CreateCustomSubscriptionInput {
  serviceName: string;
  planName: string;
  price: number;
  cycle: BillingCycle;
  startDate: Date;
  currency?: string;
  trialEndsOn?: Date;
}

export interface CustomSubscriptionRepository {
  create(input: CreateCustomSubscriptionInput): Promise<string>;
}
