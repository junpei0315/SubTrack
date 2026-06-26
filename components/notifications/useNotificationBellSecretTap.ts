import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import type { DevTestNotificationKind } from '@/src/application/buildDevTestNotificationContent';
import { sendDevTestNotification } from '@/src/infrastructure/notifications/sendDevTestNotification';

const BILLING_TAP_COUNT = 5;
const TRIAL_TAP_COUNT = 6;
const UNUSED_REVIEW_TAP_COUNT = 7;
// 1 回タップ時は短く待ってモーダルを開く。2 回目以降は隠しコマンドとして長めに待つ。
const SINGLE_TAP_DELAY_MS = 250;
const SECRET_TAP_RESET_MS = 900;

const SECRET_TAP_KINDS: Readonly<Record<number, DevTestNotificationKind>> = {
  [BILLING_TAP_COUNT]: 'billing',
  [TRIAL_TAP_COUNT]: 'trial_ending',
  [UNUSED_REVIEW_TAP_COUNT]: 'unused_review',
};

/**
 * ヘッダーの通知ベル向け隠しコマンド。
 * 5 / 6 / 7 連続タップで各種テスト通知を送る（本番ビルドでも有効）。
 * 1 回タップ時は短い待ちのあと通知設定モーダルを開く。
 */
export function useNotificationBellSecretTap(onPress: () => void): () => void {
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tapGenerationRef = useRef(0);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current) {
        clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  const scheduleTapResolution = useCallback(
    (delayMs: number, generation: number) => {
      tapTimerRef.current = setTimeout(() => {
        if (generation !== tapGenerationRef.current) {
          return;
        }

        const finalCount = tapCountRef.current;
        tapCountRef.current = 0;
        tapTimerRef.current = null;

        const kind = SECRET_TAP_KINDS[finalCount];
        if (kind) {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          void sendDevTestNotification(kind);
          return;
        }

        if (finalCount === 1) {
          onPress();
        }
      }, delayMs);
    },
    [onPress]
  );

  return useCallback(() => {
    if (Platform.OS === 'web') {
      onPress();
      return;
    }

    if (tapTimerRef.current) {
      clearTimeout(tapTimerRef.current);
      tapTimerRef.current = null;
    }

    tapCountRef.current += 1;
    const count = tapCountRef.current;
    const generation = ++tapGenerationRef.current;

    if (count === 1) {
      scheduleTapResolution(SINGLE_TAP_DELAY_MS, generation);
      return;
    }

    scheduleTapResolution(SECRET_TAP_RESET_MS, generation);
  }, [onPress, scheduleTapResolution]);
}
