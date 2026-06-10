import { useRouter } from 'expo-router';
import { useCallback } from 'react';

export interface UseHeaderParams {
  /** 通知アイコン押下時のハンドラ（未指定ならログのみ）。 */
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
 * 遷移先画面が未実装のアクションは props 未指定時にログだけ出す。
 */
export function useHeader(params: UseHeaderParams = {}): UseHeaderResult {
  const { onPressNotifications, onPressSettings, onPressAvatar } = params;
  const router = useRouter();

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
    console.log('[Header] notifications pressed');
  }, [onPressNotifications]);

  const handlePressSettings = useCallback(() => {
    if (onPressSettings) {
      onPressSettings();
      return;
    }
    router.push('/(tabs)/settings');
  }, [onPressSettings, router]);

  return { handlePressNotifications, handlePressSettings, handlePressAvatar };
}
