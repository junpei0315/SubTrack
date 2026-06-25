import React from 'react';
import { Text, View } from 'react-native';

interface AnalyticsSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  title,
  subtitle,
  badge,
  children,
}) => {
  return (
    <View className="gap-3">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-lg font-bold text-foreground">{title}</Text>
          {subtitle ? <Text className="text-sm text-subtle">{subtitle}</Text> : null}
        </View>
        {badge ? (
          <View className="rounded-full bg-accent-brand/15 px-3 py-1">
            <Text className="text-xs font-semibold text-accent-brand">{badge}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
};
