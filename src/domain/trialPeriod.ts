/**
 * お試し期間（052）のドメインルール。
 */

import { formatLocalDate, parseLocalDate } from './localDate';
import { toLocalDateOnly } from './nextBillingDate';
import type { Subscription } from './subscription';

export const TRIAL_DURATION_OPTIONS = [7, 14, 30, 60] as const;
export type TrialDurationDays = (typeof TRIAL_DURATION_OPTIONS)[number];

export const DEFAULT_TRIAL_ENDING_SOON_DAYS = 7;
export const UPCOMING_TRIALS_LOOKAHEAD_DAYS = 14;

function daysBetween(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((to.getTime() - from.getTime()) / msPerDay);
}

export function calcTrialEndsOn(startDate: Date, trialDays: number): Date {
  const base = toLocalDateOnly(startDate);
  const result = new Date(base);
  result.setDate(result.getDate() + trialDays);
  return result;
}

export function isInTrial(subscription: Subscription, today: Date = new Date()): boolean {
  if (subscription.trialEndsOn == null) {
    return false;
  }
  return toLocalDateOnly(subscription.trialEndsOn) > toLocalDateOnly(today);
}

export function isTrialEnded(subscription: Subscription, today: Date = new Date()): boolean {
  if (subscription.trialEndsOn == null) {
    return false;
  }
  return toLocalDateOnly(subscription.trialEndsOn) <= toLocalDateOnly(today);
}

export function daysUntilTrialEnds(
  subscription: Subscription,
  today: Date = new Date()
): number | null {
  if (!isInTrial(subscription, today)) {
    return null;
  }
  return daysBetween(toLocalDateOnly(today), toLocalDateOnly(subscription.trialEndsOn!));
}

export function countsTowardBillingTotals(
  subscription: Subscription,
  today: Date = new Date()
): boolean {
  return subscription.status === 'active' && !isInTrial(subscription, today);
}

export function isTrialEndingSoon(
  subscription: Subscription,
  withinDays: number = DEFAULT_TRIAL_ENDING_SOON_DAYS,
  today: Date = new Date()
): boolean {
  const remaining = daysUntilTrialEnds(subscription, today);
  return remaining != null && remaining <= withinDays;
}

export function getUpcomingTrialEnds(
  subscriptions: readonly Subscription[],
  options: {
    limit?: number;
    withinDays?: number;
    today?: Date;
  } = {}
): Subscription[] {
  const today = options.today ?? new Date();
  const withinDays = options.withinDays ?? UPCOMING_TRIALS_LOOKAHEAD_DAYS;
  const limit = options.limit ?? 5;

  return subscriptions
    .filter((subscription) => isInTrial(subscription, today))
    .filter((subscription) => {
      const remaining = daysUntilTrialEnds(subscription, today);
      return remaining != null && remaining <= withinDays;
    })
    .sort(
      (a, b) =>
        toLocalDateOnly(a.trialEndsOn!).getTime() - toLocalDateOnly(b.trialEndsOn!).getTime()
    )
    .slice(0, limit);
}

export function formatTrialEndsOnLabel(trialEndsOn: Date): string {
  return formatLocalDate(trialEndsOn).replace(/-/g, '/');
}

export function resolveTrialEndsOnFromDuration(
  startDate: Date,
  trialDays: number | null | undefined
): Date | undefined {
  if (trialDays == null || trialDays <= 0) {
    return undefined;
  }
  return calcTrialEndsOn(startDate, trialDays);
}

export function parseTrialEndsOnInput(value: string): Date | null {
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }
  return parseLocalDate(trimmed);
}
