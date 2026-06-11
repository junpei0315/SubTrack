import { Tabs } from 'expo-router';
import { ChartColumn, CreditCard, House } from 'lucide-react-native';
import React from 'react';

import { Footer } from '@/components/navigation/Footer';
import { Header } from '@/components/ui/header';

export const unstable_settings = {
  initialRouteName: 'home',
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: () => <Header />,
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
