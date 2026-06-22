import type { ScheduledNotificationItem } from '@/src/domain/notificationSchedule';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined';

export interface NotificationScheduler {
  getPermissionStatus(): Promise<NotificationPermissionStatus>;
  requestPermission(): Promise<boolean>;
  cancelSubTrackNotifications(): Promise<void>;
  schedule(items: readonly ScheduledNotificationItem[]): Promise<void>;
}
