import type { UsageLogRepository } from '@/src/ports/usageLogRepository';

/**
 * 指定サブスクの利用日を取得し、'YYYY-MM-DD' の集合で返す。
 * ヒートマップ・利用回数の集計に利用する。
 */
export async function getUsedDates(
  repository: UsageLogRepository,
  subscriptionId: string
): Promise<Set<string>> {
  const dates = await repository.listUsedDatesBySubscription(subscriptionId);
  return new Set(dates);
}
