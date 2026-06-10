import { Bell, Settings } from 'lucide-react-native';
import React from 'react';
import { Image, type ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { useHeader, type UseHeaderParams } from './useHeader';

const DEFAULT_AVATAR = require('@/assets/images/icon.png') as ImageSourcePropType;

export interface HeaderProps extends UseHeaderParams {
  /** アバターに表示する画像。未指定ならプレースホルダーを使う。 */
  avatarSource?: ImageSourcePropType;
}

/**
 * プロダクト共通ヘッダー。左にアバター、中央に SUBTRACK ロゴ、右に通知・設定アイコン。
 * 振る舞いは useHeader に委譲し、ここは見た目のみを担う。
 */
export const Header: React.FC<HeaderProps> = ({
  avatarSource,
  onPressNotifications,
  onPressSettings,
  onPressAvatar,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const { handlePressNotifications, handlePressSettings, handlePressAvatar } = useHeader({
    onPressNotifications,
    onPressSettings,
    onPressAvatar,
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.headerBackground,
          borderBottomColor: colors.headerBorder,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      <Pressable
        onPress={handlePressAvatar}
        accessibilityRole="button"
        accessibilityLabel="プロフィール"
        hitSlop={8}
      >
        <Image
          source={avatarSource ?? DEFAULT_AVATAR}
          style={[styles.avatar, { borderColor: colors.headerBorder }]}
        />
      </Pressable>

      <View style={styles.logoContainer}>
        <Text style={[styles.logo, { color: colors.brand }]} accessibilityRole="header">
          SUBTRACK
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          onPress={handlePressNotifications}
          accessibilityRole="button"
          accessibilityLabel="通知"
          hitSlop={8}
        >
          <Bell size={24} color={colors.headerText} />
        </Pressable>
        <Pressable
          onPress={handlePressSettings}
          accessibilityRole="button"
          accessibilityLabel="設定"
          hitSlop={8}
        >
          <Settings size={24} color={colors.headerText} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
  },
  logoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
});
