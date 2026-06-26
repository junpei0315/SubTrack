import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { GenreAmountPeriod } from '@/src/domain/genreInsights';

const OPTIONS: { value: GenreAmountPeriod; label: string }[] = [
  { value: 'month', label: '月額' },
  { value: 'year', label: '年額' },
];

interface AnalyticsPeriodToggleProps {
  value: GenreAmountPeriod;
  onChange: (value: GenreAmountPeriod) => void;
}

export const AnalyticsPeriodToggle: React.FC<AnalyticsPeriodToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <View className="flex-row rounded-full bg-surface p-1">
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            className={`rounded-full px-4 py-1.5 ${isActive ? 'bg-card' : ''}`}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={`text-xs font-semibold ${isActive ? 'text-foreground' : 'text-subtle'}`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
