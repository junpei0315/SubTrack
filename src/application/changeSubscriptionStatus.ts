/**
 * F-03 / 044: サブスクの一時停止・再開・解約のユースケース。
 * ステータス遷移と、それに伴う付随更新（請求日の再計算・解約日時）をここに閉じ込める。
 */

import { calcNextBillingDate } from '@/src/domain/nextBillingDate';
import type { Subscription } from '@/src/domain/subscription';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

/**
 * 一時停止する。請求日の自動繰り上げ（cron）は active のみ対象のため、
 * 停止中は next_billing_date が止まる（再開時に再計算する）。
 */
export async function pauseSubscription(
  repository: SubscriptionRepository,
  subscription: Subscription
): Promise<Subscription> {
  return repository.updateStatus(subscription.id, {
    status: 'paused',
    cancelledAt: null,
  });
}

/**
 * 停止中・解約済みから再開する。
 * 停止中に請求日が過去になっている可能性があるため、開始日とサイクルから
 * 「今日以降の最初の請求日」を再計算して同時に更新する。
 */
export async function resumeSubscription(
  repository: SubscriptionRepository,
  subscription: Subscription,
  today: Date = new Date()
): Promise<Subscription> {
  const nextBillingDate = calcNextBillingDate(subscription.startDate, subscription.plan.cycle, today);
  return repository.updateStatus(subscription.id, {
    status: 'active',
    nextBillingDate,
    cancelledAt: null,
  });
}

/**
 * 解約する。記録は残し、status を cancelled に、解約日時を記録する。
 * 物理削除は deleteSubscription を使う。
 */
export async function cancelSubscription(
  repository: SubscriptionRepository,
  subscription: Subscription,
  cancelledAt: Date = new Date()
): Promise<Subscription> {
  return repository.updateStatus(subscription.id, {
    status: 'cancelled',
    cancelledAt,
  });
}
