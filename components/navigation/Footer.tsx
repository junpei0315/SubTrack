import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppColors } from '@/constants/colors';

const ICON_SIZE = 24;
const ADD_BUTTON_SIZE = 56;

// フッターに並べるタブの順序。ここに無いルート（settings 等）は表示しない。
const VISIBLE_ROUTES = ['home', 'subscriptions', 'analytics'] as const;

// ＋ボタンを表示する画面。
const ADD_BUTTON_ROUTES = ['home', 'subscriptions'] as const;

export function Footer({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeRouteName = state.routes[state.index]?.name;
  const showAddButton = ADD_BUTTON_ROUTES.some((name) => name === activeRouteName);

  return (
    <View
      className="flex-row border-t border-border bg-background-darker pt-2.5"
      style={{ paddingBottom: insets.bottom + 8 }}
    >
      {showAddButton ? (
      <View
        pointerEvents="box-none"
        className="absolute left-0 right-0 items-center"
        style={{ top: -(ADD_BUTTON_SIZE + 12) }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="サブスクを追加"
          onPress={() => {
            if (process.env.EXPO_OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            router.push('/subscriptions/new');
          }}
          className="items-center justify-center rounded-full bg-accent-brand shadow-lg"
          style={{ width: ADD_BUTTON_SIZE, height: ADD_BUTTON_SIZE }}
        >
          <Plus size={32} color={AppColors.text} />
        </Pressable>
      </View>
      ) : null}

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
