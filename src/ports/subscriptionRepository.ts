import type { Subscription, SubscriptionStatus } from '@/src/domain/subscription';

export interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  startDate: Date;
  nextBillingDate: Date;
  /** プリセット価格と異なる場合のみ設定する */
  customPrice?: number;
}

export interface UpdateSubscriptionStatusInput {
  status: SubscriptionStatus;
  /** 再開時など、請求日を同時に更新したいときに指定する。 */
  nextBillingDate?: Date;
  /** 解約時に now を、再開・復活時に null を渡して解約日時を更新する。 */
  cancelledAt?: Date | null;
}

export interface SubscriptionRepository {
  findAll(): Promise<Subscription[]>;
  findByBillingMonth(year: number, month: number): Promise<Subscription[]>;
  findById(id: string): Promise<Subscription | null>;
  create(input: CreateSubscriptionInput): Promise<Subscription>;
  updateStatus(id: string, input: UpdateSubscriptionStatusInput): Promise<Subscription>;
  delete(id: string): Promise<void>;
}
