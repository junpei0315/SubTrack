import type { Subscription } from '@/src/domain/subscription';

export interface SubscriptionRepository {
  findByBillingMonth(year: number, month: number): Promise<Subscription[]>;
  findById(id: string): Promise<Subscription | null>;
}
