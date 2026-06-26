import React from 'react';
import { Pressable, Text, View } from 'react-native';

export type AnalyticsTab = 'summary' | 'genre' | 'trend';

const TABS: { id: AnalyticsTab; label: string }[] = [
  { id: 'summary', label: 'サマリー' },
  { id: 'genre', label: 'ジャンル' },
  { id: 'trend', label: '推移' },
];

interface AnalyticsTabBarProps {
  activeTab: AnalyticsTab;
  onTabChange: (tab: AnalyticsTab) => void;
}

export const AnalyticsTabBar: React.FC<AnalyticsTabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <View className="flex-row rounded-full bg-surface p-1">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            className={`flex-1 items-center justify-center rounded-full py-2.5 ${isActive ? 'bg-card' : ''}`}
          >
            <Text
              className={`text-sm font-semibold ${isActive ? 'text-foreground' : 'text-subtle'}`}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
