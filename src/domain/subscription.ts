/**
 * Subscription domain model and types
 */

export interface Service {
  id: string;
  name: string;
  logoUri?: string;
  /** 同梱ロゴ assets/services/{logoKey}.jpeg を指す識別子（logoUri より優先） */
  logoKey?: string;
  iconName?: string;
  category: string;
}

export interface Plan {
  id: string;
  serviceId: string;
  name: string;
  price: number;
  currency: string;
  cycle: 'monthly' | 'yearly' | 'weekly';
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  service: Service;
  plan: Plan;
  /** ユーザーが編集した契約料金。未設定時は plan.price を使う。 */
  customPrice?: number;
  nextBillingDate: Date;
  startDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  /** 解約日時。status === 'cancelled' のときのみ設定される。 */
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type SubscriptionStatus = Subscription['status'];

export interface SubscriptionForDate {
  subscription: Subscription;
  iconName: string;
}
