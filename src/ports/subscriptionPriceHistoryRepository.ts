import type { SubscriptionPriceEntry } from '@/src/domain/subscriptionPriceHistory';

export interface UpsertSubscriptionPriceEntryInput {
  subscriptionId: string;
  userId: string;
  price: number;
  effectiveFrom: Date;
}

export interface SubscriptionPriceHistoryRepository {
  listByUserId(userId: string): Promise<SubscriptionPriceEntry[]>;
  upsertEntry(input: UpsertSubscriptionPriceEntryInput): Promise<void>;
  deleteBySubscriptionId(subscriptionId: string): Promise<void>;
}
