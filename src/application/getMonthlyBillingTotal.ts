import {
  computeMonthlyBillingTotal,
  type MonthlyBillingTotal,
} from '@/src/domain/billingTotals';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';

/**
 * 指定した年月（month は 1〜12）の請求額合計を算出するユースケース。
 *
 * 取得（リポジトリ）と集計ルール（domain）を分離する。集計は domain の
 * 純粋関数に閉じているため、サブスクのデータソースや金額の変動に依存しない。
 */
export async function getMonthlyBillingTotal(
  repository: SubscriptionRepository,
  year: number,
  month: number
): Promise<MonthlyBillingTotal> {
  const subscriptions = await repository.findAll();
  return computeMonthlyBillingTotal(subscriptions, year, month);
}
