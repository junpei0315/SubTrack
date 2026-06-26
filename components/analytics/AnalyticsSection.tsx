import React from 'react';
import { Text, View } from 'react-native';

interface AnalyticsSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  title,
  subtitle,
  badge,
  action,
  children,
}) => {
  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-lg font-bold text-foreground">{title}</Text>
          {subtitle ? <Text className="text-sm text-subtle">{subtitle}</Text> : null}
        </View>
        <View className="flex-row items-center gap-2">
          {action}
          {badge ? (
            <View className="rounded-full bg-accent-brand/15 px-3 py-1">
              <Text className="text-xs font-semibold text-accent-brand">{badge}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <View className="gap-4">{children}</View>
    </View>
  );
};
