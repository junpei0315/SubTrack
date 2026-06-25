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

export interface GetUnusedSubscriptionAlertsOptions {
  /** 通知など F-11 厳格モード。分析画面では false。 */
  requireAnyUsageLogs?: boolean;
}

export async function getUnusedSubscriptionAlerts(
  subscriptionRepository: SubscriptionRepository,
  usageLogRepository: UsageLogRepository,
  userId: string,
  options: GetUnusedSubscriptionAlertsOptions = {}
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
      requireAnyUsageLogs: options.requireAnyUsageLogs ?? false,
    }),
    hasUsageLogs,
  };
}
