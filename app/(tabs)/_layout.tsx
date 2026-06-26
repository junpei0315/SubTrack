import { Tabs, useSegments } from 'expo-router';
import { ChartColumn, CreditCard, House } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';

import { Footer, WEB_TAB_BAR_LAYOUT_HEIGHT } from '@/components/navigation/Footer';
import {
  HIDDEN_TAB_BAR_STYLE,
  VISIBLE_TAB_BAR_STYLE,
} from '@/components/navigation/tabBarVisibility';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { SubscriptionRefreshProvider } from '@/components/subscriptions/SubscriptionRefreshProvider';
import { Header } from '@/components/ui/header';
import { AppColors } from '@/constants/colors';

export const unstable_settings = {
  initialRouteName: 'home',
};

function TabNavigator() {
  const segments = useSegments();
  const isAddScreen = segments[segments.length - 1] === 'new';

  return (
    <Tabs
      screenOptions={{
        lazy: false,
        headerShown: !isAddScreen,
        headerStatusBarHeight: 0,
        header: () => <Header />,
        tabBarStyle: isAddScreen ? HIDDEN_TAB_BAR_STYLE : VISIBLE_TAB_BAR_STYLE,
        sceneStyle: {
          backgroundColor: AppColors.background,
          ...(Platform.OS === 'web' ? { paddingBottom: WEB_TAB_BAR_LAYOUT_HEIGHT } : {}),
        },
      }}
      tabBar={(props) => <Footer {...props} />}
    >
        <Tabs.Screen
          name="home"
          options={{
            title: 'ホーム',
            tabBarIcon: ({ color, size }) => <House size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="subscriptions"
          options={{
            title: 'サブスクリプション',
            tabBarIcon: ({ color, size }) => <CreditCard size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: '分析',
            tabBarIcon: ({ color, size }) => <ChartColumn size={size} color={color} />,
          }}
        />
        <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <SubscriptionRefreshProvider>
      <NotificationProvider>
        <TabNavigator />
      </NotificationProvider>
    </SubscriptionRefreshProvider>
  );
}
