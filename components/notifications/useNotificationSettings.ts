import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { useAuth } from '@/components/auth/AuthProvider';
import { syncSubscriptionNotifications } from '@/src/application/syncSubscriptionNotifications';
import { expoNotificationScheduler } from '@/src/infrastructure/notifications/expoNotificationScheduler';
import { notificationPreferencesStorage } from '@/src/infrastructure/notifications/notificationPreferencesStorage';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';
import { usageLogRepositorySupabase } from '@/src/infrastructure/supabase/usageLogRepositorySupabase';
import type { NotificationPermissionStatus } from '@/src/ports/notificationScheduler';

interface UseNotificationSettingsResult {
  isEnabled: boolean;
  permissionStatus: NotificationPermissionStatus;
  isModalVisible: boolean;
  isBusy: boolean;
  errorMessage: string | null;
  openModal: () => void;
  closeModal: () => void;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => Promise<void>;
  refreshPermissionStatus: () => Promise<void>;
}

export function useNotificationSettings(): UseNotificationSettingsResult {
  const { session } = useAuth();
  const [isEnabled, setIsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermissionStatus>('undetermined');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshPermissionStatus = useCallback(async () => {
    try {
      const status = await expoNotificationScheduler.getPermissionStatus();
      setPermissionStatus(status);
    } catch {
      setPermissionStatus('undetermined');
    }
  }, []);

  const syncNotifications = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) {
      return;
    }

    await syncSubscriptionNotifications({
      userId,
      subscriptionRepository: subscriptionRepositorySupabase,
      usageLogRepository: usageLogRepositorySupabase,
      preferencesRepository: notificationPreferencesStorage,
      scheduler: expoNotificationScheduler,
    });
  }, [session?.user.id]);

  const persistEnabled = useCallback(
    async (enabled: boolean) => {
      await notificationPreferencesStorage.save({ enabled });
      setIsEnabled(enabled);
      await syncNotifications();
    },
    [syncNotifications]
  );

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const loaded = await notificationPreferencesStorage.load();
        if (isMounted) {
          setIsEnabled(loaded.enabled);
        }
      } catch {
        if (isMounted) {
          setIsEnabled(false);
        }
      }
    })();

    void refreshPermissionStatus();

    return () => {
      isMounted = false;
    };
  }, [refreshPermissionStatus]);

  useEffect(() => {
    if (!session?.user.id) {
      return;
    }
    void syncNotifications();
  }, [session?.user.id, isEnabled, syncNotifications]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void refreshPermissionStatus();
        void syncNotifications();
      }
    });

    return () => subscription.remove();
  }, [refreshPermissionStatus, syncNotifications]);

  const openModal = useCallback(() => {
    setErrorMessage(null);
    setIsModalVisible(true);
    void refreshPermissionStatus();
  }, [refreshPermissionStatus]);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setErrorMessage(null);
  }, []);

  const enableNotifications = useCallback(async () => {
    setIsBusy(true);
    setErrorMessage(null);

    try {
      const granted = await expoNotificationScheduler.requestPermission();
      await refreshPermissionStatus();

      if (!granted) {
        setErrorMessage('通知の許可が得られませんでした。端末の設定から許可してください。');
        return;
      }

      await persistEnabled(true);
    } catch {
      setErrorMessage('通知の有効化に失敗しました');
    } finally {
      setIsBusy(false);
    }
  }, [persistEnabled, refreshPermissionStatus]);

  const disableNotifications = useCallback(async () => {
    setIsBusy(true);
    setErrorMessage(null);

    try {
      await persistEnabled(false);
      await expoNotificationScheduler.cancelSubTrackNotifications();
    } catch {
      setErrorMessage('通知の無効化に失敗しました');
    } finally {
      setIsBusy(false);
    }
  }, [persistEnabled]);

  return useMemo(
    () => ({
      isEnabled,
      permissionStatus,
      isModalVisible,
      isBusy,
      errorMessage,
      openModal,
      closeModal,
      enableNotifications,
      disableNotifications,
      refreshPermissionStatus,
    }),
    [
      isEnabled,
      permissionStatus,
      isModalVisible,
      isBusy,
      errorMessage,
      openModal,
      closeModal,
      enableNotifications,
      disableNotifications,
      refreshPermissionStatus,
    ]
  );
};
