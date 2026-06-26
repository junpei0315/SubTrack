import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/colors';

const CLOSE_BUTTON_SIZE = 36;
const HANDLE_WIDTH = 40;
const HANDLE_HEIGHT = 4;

interface SheetModalHeaderProps {
  onClose: () => void;
  disabled?: boolean;
  /** モーダル内（safe area なし）なら false。フルスクリーンモーダルなら true。 */
  useSafeAreaTop?: boolean;
}

/**
 * ボトムシート型画面の上部ヘッダー。ドラッグハンドルを中央、×を右に配置する。
 */
export function SheetModalHeader({
  onClose,
  disabled = false,
  useSafeAreaTop = false,
}: SheetModalHeaderProps) {
  const insets = useSafeAreaInsets();
  const paddingTop = useSafeAreaTop ? Math.max(insets.top, 16) + 4 : 14;

  return (
    <View className="px-4 pb-3" style={{ paddingTop }}>
      <View className="flex-row items-center">
        <View style={{ width: CLOSE_BUTTON_SIZE, height: CLOSE_BUTTON_SIZE }} />
        <View className="flex-1 items-center justify-center py-1">
          <View
            className="rounded-full bg-white/25"
            style={{ width: HANDLE_WIDTH, height: HANDLE_HEIGHT }}
          />
        </View>
        <Pressable
          onPress={onClose}
          disabled={disabled}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="閉じる"
          className="items-center justify-center rounded-full bg-white/[0.08]"
          style={{ width: CLOSE_BUTTON_SIZE, height: CLOSE_BUTTON_SIZE }}
        >
          <MaterialIcons name="close" size={20} color={AppColors.subtle} />
        </Pressable>
      </View>
    </View>
  );
}
