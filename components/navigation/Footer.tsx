import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/colors';

const ICON_SIZE = 24;

// フッターに並べるタブの順序。ここに無いルート（settings 等）は表示しない。
const VISIBLE_ROUTES = ['home', 'subscriptions', 'analytics'] as const;

export function Footer({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name;

  return (
    <View
      className="flex-row border-t border-border bg-background-darker pt-2.5"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {VISIBLE_ROUTES.map((name) => {
        const route = state.routes.find((r) => r.name === name);
        if (!route) {
          return null;
        }

        const { options } = descriptors[route.key];
        const isActive = activeRouteName === name;
        const color = isActive ? AppColors.accentBrand : AppColors.subtle;
        const label = typeof options.title === 'string' ? options.title : name;

        const onPress = () => {
          if (process.env.EXPO_OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isActive && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            className="flex-1 items-center justify-center gap-1 px-0.5"
            accessibilityRole="button"
            accessibilityState={isActive ? { selected: true } : {}}
            accessibilityLabel={label}
          >
            {options.tabBarIcon?.({ focused: isActive, color, size: ICON_SIZE })}
            <Text
              className={`text-[11px] font-semibold ${isActive ? 'text-accent-brand' : 'text-subtle'}`}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
