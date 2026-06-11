import { Bell, Settings } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubTrackMark } from '@/components/branding/SubTrackMark';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { HeaderLogo } from './header-logo';
import { useHeader, type UseHeaderParams } from './useHeader';

export type HeaderProps = UseHeaderParams;

const VERTICAL_PADDING = 10;

/**
 * プロダクト共通ヘッダー。左にブランドマークとワードマーク（SubTrack＋サブタイトル）を並べ、
 * 右に通知・設定アイコンを置く。要素は上下中央に揃える。
 * 振る舞いは useHeader に委譲し、ここは見た目のみを担う。
 */
export const Header: React.FC<HeaderProps> = ({
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
          paddingTop: insets.top + VERTICAL_PADDING,
          paddingBottom: VERTICAL_PADDING,
        },
      ]}
    >
      <Pressable
        onPress={handlePressAvatar}
        accessibilityRole="button"
        accessibilityLabel="プロフィール"
        hitSlop={8}
      >
        <SubTrackMark size={56} />
      </Pressable>

      <View style={styles.logoContainer}>
        <HeaderLogo />
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
    paddingLeft: 10,
    paddingRight: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoContainer: {
    flex: 1,
    marginLeft: 10,
    overflow: 'visible',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
});
