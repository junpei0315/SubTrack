import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ACTIVE_COLOR = '#DC052D';
const INACTIVE_COLOR = '#9BA1A6';
const BACKGROUND_COLOR = '#0D0D0D';
const BORDER_COLOR = '#262626';
const ICON_SIZE = 24;

// フッターに並べるタブの順序。ここに無いルート（settings 等）は表示しない。
const VISIBLE_ROUTES = ['home', 'subscriptions', 'analytics'] as const;

export function Footer({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRouteName = state.routes[state.index]?.name;

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 8,
          backgroundColor: BACKGROUND_COLOR,
          borderTopColor: BORDER_COLOR,
        },
      ]}
    >
      {VISIBLE_ROUTES.map((name) => {
        const route = state.routes.find((r) => r.name === name);
        if (!route) {
          return null;
        }

        const { options } = descriptors[route.key];
        const isActive = activeRouteName === name;
        const color = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
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
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={isActive ? { selected: true } : {}}
            accessibilityLabel={label}
          >
            {options.tabBarIcon?.({ focused: isActive, color, size: ICON_SIZE })}
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
