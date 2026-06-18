import type { Subscription } from '@/src/domain/subscription';

export interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  startDate: Date;
  nextBillingDate: Date;
  /** プリセット価格と異なる場合のみ設定する */
  customPrice?: number;
}

export interface SubscriptionRepository {
  findAll(): Promise<Subscription[]>;
  findByBillingMonth(year: number, month: number): Promise<Subscription[]>;
  findById(id: string): Promise<Subscription | null>;
  create(input: CreateSubscriptionInput): Promise<Subscription>;
  /** 複数契約をまとめて登録する（初回オンボーディングの一括登録など）。 */
  createMany(inputs: CreateSubscriptionInput[]): Promise<Subscription[]>;
}
