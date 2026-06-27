import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useNotifications } from '@/components/notifications/NotificationProvider';
import { useNotificationBellSecretTap } from '@/components/notifications/useNotificationBellSecretTap';

export interface UseHeaderParams {
  /** 通知アイコン押下時のハンドラ（未指定時は通知設定モーダルを開く）。 */
  onPressNotifications?: () => void;
  /** 設定アイコン押下時のハンドラ（未指定なら設定画面へ遷移）。 */
  onPressSettings?: () => void;
  /** ブランドマーク押下時のハンドラ（未指定ならホーム画面へ遷移）。 */
  onPressLogo?: () => void;
}

export interface UseHeaderResult {
  handlePressNotifications: () => void;
  handlePressSettings: () => void;
  handlePressLogo: () => void;
}

/**
 * Header の振る舞い（ナビゲーション・アクション）を切り出すフック。
 * 通知は props 未指定時に通知設定モーダルを開く。
 */
export function useHeader(params: UseHeaderParams = {}): UseHeaderResult {
  const { onPressNotifications, onPressSettings, onPressLogo } = params;
  const router = useRouter();
  const { openSettingsModal } = useNotifications();

  const handlePressLogo = useCallback(() => {
    if (onPressLogo) {
      onPressLogo();
      return;
    }
    router.replace('/(tabs)/home');
  }, [onPressLogo, router]);

  const defaultPressNotifications = useCallback(() => {
    openSettingsModal();
  }, [openSettingsModal]);

  const handlePressNotificationsWithSecretTap = useNotificationBellSecretTap(
    onPressNotifications ?? defaultPressNotifications
  );

  const handlePressNotifications = useCallback(() => {
    if (onPressNotifications) {
      onPressNotifications();
      return;
    }
    handlePressNotificationsWithSecretTap();
  }, [onPressNotifications, handlePressNotificationsWithSecretTap]);

  const handlePressSettings = useCallback(() => {
    if (onPressSettings) {
      onPressSettings();
      return;
    }
    router.push('/(tabs)/settings');
  }, [onPressSettings, router]);

  return { handlePressNotifications, handlePressSettings, handlePressLogo };
}
