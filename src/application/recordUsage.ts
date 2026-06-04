import type { UsageLogRepository } from '@/src/ports/usageLogRepository';

export interface RecordUsageInput {
  userId: string;
  subscriptionId: string;
  usedDate: string;
}

/**
 * 利用日を記録する（F-08）。同日重複は repository 側で冪等に扱う。
 */
export async function recordUsage(
  repository: UsageLogRepository,
  { userId, subscriptionId, usedDate }: RecordUsageInput
): Promise<void> {
  await repository.addUsedDate({ userId, subscriptionId, usedDate });
}
