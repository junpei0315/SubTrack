import React from 'react';
import { Text } from 'react-native';

import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';

interface AnalyticsMetricCardProps {
  label: string;
  value: string;
  valueClassName?: string;
  className?: string;
}

export const AnalyticsMetricCard: React.FC<AnalyticsMetricCardProps> = ({
  label,
  value,
  valueClassName = 'text-foreground',
  className,
}) => {
  return (
    <AnalyticsCard className={`min-w-0 flex-1 gap-1 py-3 ${className ?? ''}`}>
      <Text className="text-xs font-medium text-subtle" numberOfLines={2}>
        {label}
      </Text>
      <Text className={`text-xl font-bold ${valueClassName}`} numberOfLines={1}>
        {value}
      </Text>
    </AnalyticsCard>
  );
};
