import { isInTrial } from './trialPeriod';
import type { Subscription } from './subscription';
import { getMonthlyNormalizedPrice, getYearlyNormalizedPrice } from './normalizeBilling';

export function getBillableMonthlyNormalizedPrice(
  subscription: Subscription,
  today: Date = new Date()
): number {
  if (isInTrial(subscription, today)) {
    return 0;
  }
  return getMonthlyNormalizedPrice(subscription);
}

export function getBillableYearlyNormalizedPrice(
  subscription: Subscription,
  today: Date = new Date()
): number {
  if (isInTrial(subscription, today)) {
    return 0;
  }
  return getYearlyNormalizedPrice(subscription);
}
