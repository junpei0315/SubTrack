import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection';
import { BarTrendChart } from '@/components/analytics/BarTrendChart';
import { AppColors } from '@/constants/colors';
import { formatPrice } from '@/src/domain/money';
import type { MonthlySpendingTrend } from '@/src/domain/monthlySpendingTrend';

interface SpendingTrendSectionProps {
  trend: MonthlySpendingTrend | null;
}

export const SpendingTrendSection: React.FC<SpendingTrendSectionProps> = ({ trend }) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

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

  const currentActualPoint =
    trend?.points.find(
      (point) =>
        !point.isProjected &&
        point.yearMonth.year === currentYear &&
        point.yearMonth.month === currentMonth
    ) ?? trend?.points.find((point) => !point.isProjected);

  if (!trend || points.every((point) => point.amount === 0)) {
    return (
      <AnalyticsSection
        title="支出の推移"
        subtitle="契約情報から算出した想定支出（実際の引き落とし履歴ではありません）"
      >
        <AnalyticsCard>
          <Text className="text-sm text-subtle">表示できる契約データがありません</Text>
        </AnalyticsCard>
      </AnalyticsSection>
    );
  }

  return (
    <AnalyticsSection
      title="支出の推移"
      subtitle="契約情報から算出した想定支出（実際の引き落とし履歴ではありません）"
    >
      <AnalyticsCard className="gap-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarTrendChart points={points} />
        </ScrollView>

        <View className="flex-row items-center gap-4">
          <LegendDot color={AppColors.accentBrand} label="確定・過去" />
          <LegendDot color="rgba(220, 5, 45, 0.35)" label="想定（未来）" />
        </View>
      </AnalyticsCard>

      <AnalyticsCard>
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
          今月の想定支出
        </Text>
        <Text className="mt-1 text-2xl font-bold text-foreground">
          {formatPrice(currentActualPoint?.amount ?? 0, trend.currency)}
        </Text>
      </AnalyticsCard>
    </AnalyticsSection>
  );
};

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
      <Text className="text-xs text-subtle">{label}</Text>
    </View>
  );
}
