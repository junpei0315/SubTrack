import type { Subscription } from '@/src/domain/subscription';
import { getEffectiveSubscriptionPrice } from '@/src/domain/subscriptionPrice';
import {
  firstDayOfMonth,
  normalizeSubscriptionPrice,
  resolveSubscriptionPrice,
  type PriceChangeScope,
} from '@/src/domain/subscriptionPriceHistory';
import type { SubscriptionPriceHistoryRepository } from '@/src/ports/subscriptionPriceHistoryRepository';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

export interface UpdateSubscriptionDetailsParams {
  subscription: Subscription;
  price: number;
  startDate: Date;
  nextBillingDate: Date;
  priceChangeScope: PriceChangeScope;
  now?: Date;
}

function pricesEqual(a: number, b: number): boolean {
  return normalizeSubscriptionPrice(a) === normalizeSubscriptionPrice(b);
}

/**
 * F-03: 契約の料金・日付を更新する。
 * 料金変更時は「過去すべて」か「今月から」を選べる。
 */
export async function updateSubscriptionDetails(
  subscriptionRepository: SubscriptionRepository,
  priceHistoryRepository: SubscriptionPriceHistoryRepository,
  params: UpdateSubscriptionDetailsParams
): Promise<Subscription> {
  const now = params.now ?? new Date();
  const normalizedPrice = normalizeSubscriptionPrice(params.price);
  const currentPrice = getEffectiveSubscriptionPrice(params.subscription);
  const priceChanged = !pricesEqual(currentPrice, normalizedPrice);

  if (priceChanged) {
    if (params.priceChangeScope === 'all_time') {
      await priceHistoryRepository.deleteBySubscriptionId(params.subscription.id);
    } else {
      const history = await priceHistoryRepository.listByUserId(params.subscription.userId);
      const existingForSub = history.filter((entry) => entry.subscriptionId === params.subscription.id);
      const priceAtNow = resolveSubscriptionPrice(params.subscription, existingForSub, now);

      if (existingForSub.length === 0) {
        await priceHistoryRepository.upsertEntry({
          subscriptionId: params.subscription.id,
          userId: params.subscription.userId,
          price: normalizeSubscriptionPrice(priceAtNow),
          effectiveFrom: params.subscription.startDate,
        });
      }

      await priceHistoryRepository.upsertEntry({
        subscriptionId: params.subscription.id,
        userId: params.subscription.userId,
        price: normalizedPrice,
        effectiveFrom: firstDayOfMonth(now),
      });
    }
  }

  const presetPrice = params.subscription.plan.price;
  const customPrice = pricesEqual(normalizedPrice, presetPrice) ? null : normalizedPrice;

  return subscriptionRepository.updateDetails(params.subscription.id, {
    startDate: params.startDate,
    nextBillingDate: params.nextBillingDate,
    customPrice,
  });
}
