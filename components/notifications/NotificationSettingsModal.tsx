import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/colors';
import type { NotificationPermissionStatus } from '@/src/ports/notificationScheduler';

interface NotificationSettingsModalProps {
  visible: boolean;
  isEnabled: boolean;
  permissionStatus: NotificationPermissionStatus;
  isBusy: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onEnable: () => void;
  onDisable: () => void;
}

function StatusMessage({
  isEnabled,
  permissionStatus,
}: {
  isEnabled: boolean;
  permissionStatus: NotificationPermissionStatus;
}) {
  if (permissionStatus === 'denied') {
    return (
      <Text className="text-[13px] text-muted">
        端末の設定アプリから SubTrack の通知を許可してください
      </Text>
    );
  }

  if (isEnabled && permissionStatus === 'granted') {
    return <Text className="text-[13px] text-success">通知を許可しています</Text>;
  }

  return (
    <Text className="text-[13px] text-muted">
      通知を許可すると、以下のお知らせが届きます
    </Text>
  );
}

/**
 * ヘッダーの通知ボタンから開く設定モーダル。
 */
export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  visible,
  isEnabled,
  permissionStatus,
  isBusy,
  errorMessage,
  onClose,
  onEnable,
  onDisable,
}) => {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const isActive = isEnabled && permissionStatus === 'granted' && !isWeb;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-card px-5 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          onPress={(event) => event.stopPropagation()}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-foreground">通知設定</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="閉じる"
              onPress={onClose}
              hitSlop={8}
            >
              <MaterialIcons name="close" size={24} color={AppColors.text} />
            </TouchableOpacity>
          </View>

          {isWeb ? (
            <Text className="mb-4 text-[13px] text-muted">
              プッシュ通知は iOS / Android アプリでのみ利用できます。
            </Text>
          ) : (
            <View className="mb-4">
              <StatusMessage isEnabled={isEnabled} permissionStatus={permissionStatus} />
            </View>
          )}

          <View className="mb-5 gap-2 rounded-xl border border-white/10 px-4 py-3">
            <Text className="text-[13px] leading-5 text-muted">
              ・支払い日当日のリマインド{'\n'}
              ・長期間使っていないサブスクの見直し
            </Text>
          </View>

          {errorMessage ? (
            <Text className="mb-3 text-[13px] text-error-alt">{errorMessage}</Text>
          ) : null}

          {isActive ? (
            <TouchableOpacity
              className="items-center rounded-full border border-border-muted py-3.5"
              disabled={isBusy}
              onPress={() => void onDisable()}
            >
              {isBusy ? (
                <ActivityIndicator color={AppColors.text} />
              ) : (
                <Text className="text-base font-semibold text-foreground">通知を許可しない</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="items-center rounded-full bg-accent-brand py-3.5"
              disabled={isBusy || isWeb}
              onPress={() => void onEnable()}
            >
              {isBusy ? (
                <ActivityIndicator color={AppColors.text} />
              ) : (
                <Text className="text-base font-semibold text-foreground">通知を許可する</Text>
              )}
            </TouchableOpacity>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
