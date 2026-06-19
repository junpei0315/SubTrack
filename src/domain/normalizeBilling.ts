/**
 * 請求サイクルごとの金額換算（F-05 / F-06）。
 * ドメイン層なので React / Supabase 等には依存しない。
 */

import type { BillingCycle } from './billingCycle';
import type { Subscription } from './subscription';
import { getEffectiveSubscriptionPrice } from './subscriptionPrice';

const WEEKS_PER_MONTH = 4.3;
const WEEKS_PER_YEAR = 52;
const MONTHS_PER_YEAR = 12;

export function normalizeToMonthlyAmount(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly':
      return price;
    case 'yearly':
      return price / MONTHS_PER_YEAR;
    case 'weekly':
      return price * WEEKS_PER_MONTH;
  }
}

export function normalizeToYearlyAmount(price: number, cycle: BillingCycle): number {
  switch (cycle) {
    case 'monthly':
      return price * MONTHS_PER_YEAR;
    case 'yearly':
      return price;
    case 'weekly':
      return price * WEEKS_PER_YEAR;
  }
}

export function getMonthlyNormalizedPrice(subscription: Subscription): number {
  const price = getEffectiveSubscriptionPrice(subscription);
  return normalizeToMonthlyAmount(price, subscription.plan.cycle);
}

export function getYearlyNormalizedPrice(subscription: Subscription): number {
  const price = getEffectiveSubscriptionPrice(subscription);
  return normalizeToYearlyAmount(price, subscription.plan.cycle);
}
