import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { ScheduledNotificationItem } from '@/src/domain/notificationSchedule';
import type {
  NotificationPermissionStatus,
  NotificationScheduler,
} from '@/src/ports/notificationScheduler';

const ANDROID_CHANNEL_ID = 'subtrack-default';
const SUBTRACK_IDENTIFIER_PREFIXES = ['billing-', 'unused-review', 'trial-'] as const;

function isSubTrackIdentifier(identifier: string): boolean {
  return SUBTRACK_IDENTIFIER_PREFIXES.some((prefix) => identifier.startsWith(prefix));
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'SubTrack',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export const expoNotificationScheduler: NotificationScheduler = {
  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    if (Platform.OS === 'web') {
      return 'denied';
    }

    const { status } = await Notifications.getPermissionsAsync();
    if (status === 'granted') {
      return 'granted';
    }
    if (status === 'denied') {
      return 'denied';
    }
    return 'undetermined';
  },

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    const current = await this.getPermissionStatus();
    if (current === 'granted') {
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },

  async cancelSubTrackNotifications(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((item) => isSubTrackIdentifier(item.identifier))
        .map((item) => Notifications.cancelScheduledNotificationAsync(item.identifier))
    );
  },

  async schedule(items: readonly ScheduledNotificationItem[]): Promise<void> {
    if (Platform.OS === 'web' || items.length === 0) {
      return;
    }

    await ensureAndroidChannel();

    for (const item of items) {
      await Notifications.scheduleNotificationAsync({
        identifier: item.identifier,
        content: {
          title: item.title,
          body: item.body,
          data: item.data,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: item.triggerDate,
          channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
        },
      });
    }
  },
};
