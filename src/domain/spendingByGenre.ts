/**
 * ジャンル別支出の内訳（F-06）。
 */

import { convertToJpy, DISPLAY_CURRENCY, type ExchangeRates } from './exchangeRate';
import { getMonthlyNormalizedPrice } from './normalizeBilling';
import type { Subscription } from './subscription';

export interface GenreSpendingSubscription {
  id: string;
  serviceName: string;
  amount: number;
}

export interface GenreSpendingItem {
  genre: string;
  amount: number;
  percentage: number;
  subscriptions: GenreSpendingSubscription[];
}

export interface GenreSpendingBreakdown {
  totalMonthlyAmount: number;
  currency: string;
  items: GenreSpendingItem[];
}

const OTHER_GENRE_LABEL = 'その他';
const SMALL_SEGMENT_THRESHOLD = 0.05;

export function computeGenreSpendingBreakdown(
  subscriptions: Subscription[],
  rates: ExchangeRates
): GenreSpendingBreakdown {
  const active = subscriptions.filter((sub) => sub.status === 'active');

  if (active.length === 0) {
    return { totalMonthlyAmount: 0, currency: DISPLAY_CURRENCY, items: [] };
  }

  const currency = DISPLAY_CURRENCY;
  const byGenre = new Map<string, GenreSpendingSubscription[]>();

  for (const sub of active) {
    const genre = sub.service.category || OTHER_GENRE_LABEL;
    const amount = convertToJpy(getMonthlyNormalizedPrice(sub), sub.plan.currency, rates);
    const list = byGenre.get(genre) ?? [];
    list.push({ id: sub.id, serviceName: sub.service.name, amount });
    byGenre.set(genre, list);
  }

  const rawItems: GenreSpendingItem[] = [...byGenre.entries()].map(([genre, subs]) => ({
    genre,
    amount: subs.reduce((sum, s) => sum + s.amount, 0),
    percentage: 0,
    subscriptions: subs.sort((a, b) => b.amount - a.amount),
  }));

  const totalMonthlyAmount = rawItems.reduce((sum, item) => sum + item.amount, 0);

  if (totalMonthlyAmount <= 0) {
    return { totalMonthlyAmount: 0, currency, items: [] };
  }

  const withPercentages = rawItems.map((item) => ({
    ...item,
    percentage: item.amount / totalMonthlyAmount,
  }));

  const major: GenreSpendingItem[] = [];
  const minor: GenreSpendingItem[] = [];

  for (const item of withPercentages) {
    if (item.percentage < SMALL_SEGMENT_THRESHOLD) {
      minor.push(item);
    } else {
      major.push(item);
    }
  }

  if (minor.length === 0) {
    return {
      totalMonthlyAmount,
      currency,
      items: major.sort((a, b) => b.amount - a.amount),
    };
  }

  const otherAmount = minor.reduce((sum, item) => sum + item.amount, 0);
  const otherSubs = minor.flatMap((item) => item.subscriptions);
  const existingOther = major.find((item) => item.genre === OTHER_GENRE_LABEL);

  if (existingOther) {
    existingOther.amount += otherAmount;
    existingOther.subscriptions = [...existingOther.subscriptions, ...otherSubs].sort(
      (a, b) => b.amount - a.amount
    );
    existingOther.percentage = existingOther.amount / totalMonthlyAmount;
  } else {
    major.push({
      genre: OTHER_GENRE_LABEL,
      amount: otherAmount,
      percentage: otherAmount / totalMonthlyAmount,
      subscriptions: otherSubs.sort((a, b) => b.amount - a.amount),
    });
  }

  return {
    totalMonthlyAmount,
    currency,
    items: major.sort((a, b) => b.amount - a.amount),
  };
}
