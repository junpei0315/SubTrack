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
  nextBillingDate: Date;
  startDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionForDate {
  subscription: Subscription;
  iconName: string;
}
