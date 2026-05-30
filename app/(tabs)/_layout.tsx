import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { LayoutGrid } from '@/components/ui/lucide-wrapper';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ChartNoAxesColumn, Settings } from 'lucide-react-native';

export const unstable_settings = {
  initialRouteName: 'home',
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color }) => <LayoutGrid size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: '分析',
          tabBarIcon: ({ color }) => <ChartNoAxesColumn size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color }) => <Settings size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
