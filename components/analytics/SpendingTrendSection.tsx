import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { BarTrendChart } from '@/components/analytics/BarTrendChart';
import { formatPrice } from '@/src/domain/money';
import type { MonthlySpendingTrend } from '@/src/domain/monthlySpendingTrend';

interface SpendingTrendSectionProps {
  trend: MonthlySpendingTrend | null;
}

export const SpendingTrendSection: React.FC<SpendingTrendSectionProps> = ({ trend }) => {
  const points = useMemo(
    () =>
      (trend?.points ?? []).map((point) => ({
        key: `${point.yearMonth.year}-${point.yearMonth.month}`,
        label: point.label,
        amount: point.amount,
        isProjected: point.isProjected,
      })),
    [trend]
  );

  if (!trend || points.every((point) => point.amount === 0)) {
    return (
      <View className="gap-2">
        <Text className="text-base font-bold text-foreground">支出の推移</Text>
        <Text className="text-sm text-subtle">表示できる契約データがありません</Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="text-base font-bold text-foreground">支出の推移</Text>
        <Text className="text-xs text-subtle">
          契約情報から算出した想定支出です（実際の引き落とし履歴ではありません）
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarTrendChart points={points} />
      </ScrollView>

      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-sm bg-accent-brand" />
          <Text className="text-xs text-subtle">確定・過去</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="h-2.5 w-2.5 rounded-sm bg-accent-brand/35" />
          <Text className="text-xs text-subtle">想定（未来）</Text>
        </View>
      </View>

      <View className="rounded-2xl bg-card px-4 py-3">
        <Text className="text-xs text-subtle">今月の想定支出</Text>
        <Text className="text-xl font-bold text-foreground">
          {formatPrice(
            trend.points.find((point) => !point.isProjected && point.label === '今月')?.amount ??
              trend.points.find((point) => !point.isProjected)?.amount ??
              0,
            trend.currency
          )}
        </Text>
      </View>
    </View>
  );
};
