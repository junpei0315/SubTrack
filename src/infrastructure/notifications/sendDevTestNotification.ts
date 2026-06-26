import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  buildDevTestNotificationContent,
  type DevTestNotificationKind,
} from '@/src/application/buildDevTestNotificationContent';
import { expoNotificationScheduler } from './expoNotificationScheduler';

const ANDROID_CHANNEL_ID = 'subtrack-default';
const DEV_TEST_NOTIFICATION_IDENTIFIER = 'dev-test-notification';

let sendInFlight: Promise<boolean> | null = null;

async function cancelPendingDevTestNotifications(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(DEV_TEST_NOTIFICATION_IDENTIFIER);
}

/**
 * 隠しコマンドから呼ぶテスト通知（本番ビルドでも有効。Web のみ no-op）。
 */
export async function sendDevTestNotification(kind: DevTestNotificationKind): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  if (sendInFlight) {
    return sendInFlight;
  }

  sendInFlight = (async () => {
    try {
      const permission = await expoNotificationScheduler.getPermissionStatus();
      if (permission !== 'granted') {
        const granted = await expoNotificationScheduler.requestPermission();
        if (!granted) {
          return false;
        }
      }

      const content = await buildDevTestNotificationContent(kind);
      if (!content) {
        return false;
      }

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
          name: 'SubTrack',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      await cancelPendingDevTestNotifications();

      await Notifications.scheduleNotificationAsync({
        identifier: DEV_TEST_NOTIFICATION_IDENTIFIER,
        content: {
          title: content.title,
          body: content.body,
          data: content.data,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          channelId: Platform.OS === 'android' ? ANDROID_CHANNEL_ID : undefined,
        },
      });

      return true;
    } finally {
      sendInFlight = null;
    }
  })();

  return sendInFlight;
}
