import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

import { NotificationSettingsModal } from '@/components/notifications/NotificationSettingsModal';
import { useNotificationSettings } from '@/components/notifications/useNotificationSettings';
import type { NotificationPayloadType } from '@/src/domain/notificationSchedule';

interface NotificationContextValue {
  openSettingsModal: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function isNotificationPayloadType(value: unknown): value is NotificationPayloadType {
  return value === 'billing' || value === 'unused_review' || value === 'trial_ending';
}

function configureForegroundHandler(): void {
  if (Platform.OS === 'web') {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

configureForegroundHandler();

export function NotificationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const settings = useNotificationSettings();

  const openSettingsModal = useCallback(() => {
    settings.openModal();
  }, [settings]);

  const handleNotificationResponse = useCallback(
    (response: Notifications.NotificationResponse) => {
      const rawType = response.notification.request.content.data?.type;
      if (!isNotificationPayloadType(rawType)) {
        return;
      }

      if (rawType === 'billing' || rawType === 'trial_ending') {
        const subscriptionId = response.notification.request.content.data?.subscriptionId;
        if (typeof subscriptionId === 'string' && subscriptionId.length > 0) {
          router.push(`/(tabs)/subscriptions/${subscriptionId}`);
        }
        return;
      }

      router.push('/(tabs)/analytics');
    },
    [router]
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );
    return () => subscription.remove();
  }, [handleNotificationResponse]);

  return (
    <NotificationContext.Provider value={{ openSettingsModal }}>
      {children}
      <NotificationSettingsModal
        visible={settings.isModalVisible}
        isEnabled={settings.isEnabled}
        permissionStatus={settings.permissionStatus}
        isBusy={settings.isBusy}
        errorMessage={settings.errorMessage}
        onClose={settings.closeModal}
        onEnable={settings.enableNotifications}
        onDisable={settings.disableNotifications}
      />
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}
