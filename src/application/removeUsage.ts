import type { UsageLogRepository } from '@/src/ports/usageLogRepository';

export interface RemoveUsageInput {
  subscriptionId: string;
  usedDate: string;
}

/**
 * 利用日の記録を取り消す（F-08）。
 */
export async function removeUsage(
  repository: UsageLogRepository,
  { subscriptionId, usedDate }: RemoveUsageInput
): Promise<void> {
  await repository.removeUsedDate({ subscriptionId, usedDate });
}
