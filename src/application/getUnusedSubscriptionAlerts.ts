import {
  buildLastUsedDateMap,
  detectUnusedSubscriptions,
  type UnusedSubscriptionAlert,
} from '@/src/domain/unusedSubscriptions';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';
import type { UsageLogRepository } from '@/src/ports/usageLogRepository';

export interface UnusedSubscriptionAlertsResult {
  alerts: UnusedSubscriptionAlert[];
  hasUsageLogs: boolean;
}

export async function getUnusedSubscriptionAlerts(
  subscriptionRepository: SubscriptionRepository,
  usageLogRepository: UsageLogRepository,
  userId: string
): Promise<UnusedSubscriptionAlertsResult> {
  const [subscriptions, usageRows] = await Promise.all([
    subscriptionRepository.findAll(),
    usageLogRepository.listUsedDatesByUserId(userId),
  ]);

  const hasUsageLogs = usageRows.length > 0;

  return {
    alerts: detectUnusedSubscriptions({
      subscriptions,
      lastUsedDateBySubscriptionId: buildLastUsedDateMap(usageRows),
      hasAnyUsageLogs: hasUsageLogs,
    }),
    hasUsageLogs,
  };
}
