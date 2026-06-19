import {
  buildLastUsedDateMap,
  detectUnusedSubscriptions,
  type UnusedSubscriptionAlert,
} from '@/src/domain/unusedSubscriptions';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';
import type { UsageLogRepository } from '@/src/ports/usageLogRepository';

export async function getUnusedSubscriptionAlerts(
  subscriptionRepository: SubscriptionRepository,
  usageLogRepository: UsageLogRepository,
  userId: string
): Promise<UnusedSubscriptionAlert[]> {
  const [subscriptions, usageRows] = await Promise.all([
    subscriptionRepository.findAll(),
    usageLogRepository.listUsedDatesByUserId(userId),
  ]);

  return detectUnusedSubscriptions({
    subscriptions,
    lastUsedDateBySubscriptionId: buildLastUsedDateMap(usageRows),
    hasAnyUsageLogs: usageRows.length > 0,
  });
}
