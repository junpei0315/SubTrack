import { buildNotificationSchedule } from '@/src/domain/notificationSchedule';
import type { NotificationPreferencesRepository } from '@/src/ports/notificationPreferencesRepository';
import type { NotificationScheduler } from '@/src/ports/notificationScheduler';
import type { SubscriptionRepository } from '@/src/ports/subscriptionRepository';
import type { UsageLogRepository } from '@/src/ports/usageLogRepository';

import { getUnusedSubscriptionAlerts } from './getUnusedSubscriptionAlerts';

export async function syncSubscriptionNotifications(input: {
  userId: string;
  subscriptionRepository: SubscriptionRepository;
  usageLogRepository: UsageLogRepository;
  preferencesRepository: NotificationPreferencesRepository;
  scheduler: NotificationScheduler;
}): Promise<void> {
  const preferences = await input.preferencesRepository.load();
  const permission = await input.scheduler.getPermissionStatus();

  if (!preferences.enabled || permission !== 'granted') {
    await input.scheduler.cancelSubTrackNotifications();
    return;
  }

  const [subscriptions, { alerts: unusedAlerts }] = await Promise.all([
    input.subscriptionRepository.findAll(),
    getUnusedSubscriptionAlerts(
      input.subscriptionRepository,
      input.usageLogRepository,
      input.userId
    ),
  ]);

  const items = buildNotificationSchedule({
    subscriptions,
    unusedAlerts,
  });

  await input.scheduler.cancelSubTrackNotifications();
  await input.scheduler.schedule(items);
}
