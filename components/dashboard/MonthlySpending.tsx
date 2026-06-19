import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import { AppColors } from '@/constants/colors';
import { formatPrice } from '@/src/domain/money';

import { type SpendingPeriod, useMonthlySpending } from './useMonthlySpending';

const PERIOD_OPTIONS: { value: SpendingPeriod; label: string }[] = [
  { value: 'month', label: '月間' },
  { value: 'year', label: '年間' },
];

export const MonthlySpending: React.FC = () => {
  const { period, setPeriod, total, isLoading, errorMessage } = useMonthlySpending();
  const titleText = period === 'month' ? '月額換算の合計支出' : '年額換算の合計支出';

  return (
    <View className="mb-4 self-stretch">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-muted">{titleText}</Text>
        <View className="flex-row rounded-full p-[3px]">
          {PERIOD_OPTIONS.map((option) => {
            const isActive = option.value === period;
            return (
              <TouchableOpacity
                key={option.value}
                className={`rounded-full px-4 py-1.5 ${isActive ? 'bg-accent-brand' : ''}`}
                onPress={() => setPeriod(option.value)}
                activeOpacity={0.8}
              >
                <Text
                  className={`text-[13px] font-semibold ${isActive ? 'text-foreground' : 'text-muted'}`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator color={AppColors.text} className="h-[43px] self-start" />
      ) : errorMessage ? (
        <Text className="text-sm text-accent">{errorMessage}</Text>
      ) : (
        <Text className="text-[36px] font-bold text-foreground">
          {formatPrice(total.amount, total.currency)}
        </Text>
      )}
    </View>
  );
};
