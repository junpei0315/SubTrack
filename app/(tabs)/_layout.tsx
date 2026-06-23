import { Tabs } from 'expo-router';
import { ChartColumn, CreditCard, House } from 'lucide-react-native';
import React from 'react';
import { Platform } from 'react-native';

import { Footer, WEB_TAB_BAR_LAYOUT_HEIGHT } from '@/components/navigation/Footer';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { Header } from '@/components/ui/header';
import { AppColors } from '@/constants/colors';

export const unstable_settings = {
  initialRouteName: 'home',
};

export default function TabLayout() {
  return (
    <NotificationProvider>
      <Tabs
        screenOptions={{
          headerShown: true,
          header: () => <Header />,
          tabBarStyle:
            Platform.OS === 'web'
              ? {
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 0,
                  overflow: 'visible',
                  backgroundColor: 'transparent',
                  borderTopWidth: 0,
                  elevation: 0,
                }
              : {
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: AppColors.backgroundDarker,
                  borderTopWidth: 0,
                  elevation: 0,
                },
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
    </NotificationProvider>
  );
}
