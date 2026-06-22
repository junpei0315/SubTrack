import { useRouter } from 'expo-router';
import { useCallback } from 'react';

import { useNotifications } from '@/components/notifications/NotificationProvider';

export interface UseHeaderParams {
  /** 通知アイコン押下時のハンドラ（未指定時は何もしない）。 */
  onPressNotifications?: () => void;
  /** 設定アイコン押下時のハンドラ（未指定なら設定画面へ遷移）。 */
  onPressSettings?: () => void;
  /** アバター押下時のハンドラ（未指定なら設定画面へ遷移）。 */
  onPressAvatar?: () => void;
}

export interface UseHeaderResult {
  handlePressNotifications: () => void;
  handlePressSettings: () => void;
  handlePressAvatar: () => void;
}

/**
 * Header の振る舞い（ナビゲーション・アクション）を切り出すフック。
 * 通知は props 未指定時に通知設定モーダルを開く。
 */
export function useHeader(params: UseHeaderParams = {}): UseHeaderResult {
  const { onPressNotifications, onPressSettings, onPressAvatar } = params;
  const router = useRouter();
  const { openSettingsModal } = useNotifications();

  const handlePressAvatar = useCallback(() => {
    if (onPressAvatar) {
      onPressAvatar();
      return;
    }
    router.push('/(tabs)/settings');
  }, [onPressAvatar, router]);

  const handlePressNotifications = useCallback(() => {
    if (onPressNotifications) {
      onPressNotifications();
      return;
    }
    openSettingsModal();
  }, [onPressNotifications, openSettingsModal]);

  const handlePressSettings = useCallback(() => {
    if (onPressSettings) {
      onPressSettings();
      return;
    }
    router.push('/(tabs)/settings');
  }, [onPressSettings, router]);

  return { handlePressNotifications, handlePressSettings, handlePressAvatar };
}
