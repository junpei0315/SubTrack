import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { AnalyticsPeriodToggle } from '@/components/analytics/AnalyticsPeriodToggle';
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection';
import { getChartColor } from '@/components/analytics/chartColors';
import { DonutChart } from '@/components/analytics/DonutChart';
import {
  averageAmountPerSubscription,
  buildGenreInsight,
  formatGenreServiceSummary,
  genrePeriodLabel,
  scaleGenreAmount,
  type GenreAmountPeriod,
} from '@/src/domain/genreInsights';
import { formatPrice } from '@/src/domain/money';
import type { GenreSpendingBreakdown, GenreSpendingItem } from '@/src/domain/spendingByGenre';

interface GenreBreakdownSectionProps {
  breakdown: GenreSpendingBreakdown | null;
}

export const GenreBreakdownSection: React.FC<GenreBreakdownSectionProps> = ({ breakdown }) => {
  const [selectedGenre, setSelectedGenre] = useState<GenreSpendingItem | null>(null);
  const [period, setPeriod] = useState<GenreAmountPeriod>('month');

  const segments = useMemo(
    () =>
      (breakdown?.items ?? []).map((item) => ({
        key: item.genre,
        value: item.amount,
        percentage: item.percentage,
      })),
    [breakdown]
  );

  const insight = useMemo(
    () => (breakdown ? buildGenreInsight(breakdown) : null),
    [breakdown]
  );

  const topPercentage = breakdown?.items[0]
    ? Math.round(breakdown.items[0].percentage * 100)
    : 0;

  const periodLabel = genrePeriodLabel(period);

  if (!breakdown || breakdown.items.length === 0) {
    return (
      <AnalyticsSection title="ジャンル別の支出" subtitle={periodLabel}>
        <AnalyticsCard>
          <Text className="text-sm text-subtle">契約中のサブスクがありません</Text>
        </AnalyticsCard>
      </AnalyticsSection>
    );
  }

  const totalAmount = scaleGenreAmount(breakdown.totalMonthlyAmount, period);

  return (
    <AnalyticsSection
      title="ジャンル別の支出"
      subtitle={periodLabel}
      action={<AnalyticsPeriodToggle value={period} onChange={setPeriod} />}
    >
      {insight ? (
        <AnalyticsCard className="bg-surface/60 py-3">
          <Text className="text-sm text-foreground">{insight}</Text>
        </AnalyticsCard>
      ) : null}

      <AnalyticsCard className="gap-5 py-5">
        <View className="items-center">
          <View className="relative items-center justify-center">
            <DonutChart segments={segments} size={148} strokeWidth={24} />
            <View className="absolute items-center justify-center">
              <Text className="text-2xl font-bold text-foreground">{topPercentage}%</Text>
              <Text className="text-[10px] text-subtle">最大ジャンル</Text>
            </View>
          </View>
        </View>

        <View className="gap-3">
          {breakdown.items.map((item, index) => {
            const count = item.subscriptions.length;
            const summary = formatGenreServiceSummary(item);
            const average = averageAmountPerSubscription(item);
            const displayAmount = scaleGenreAmount(item.amount, period);

            return (
              <Pressable
                key={item.genre}
                onPress={() => setSelectedGenre(item)}
                className="active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel={`${item.genre} ${Math.round(item.percentage * 100)}パーセント`}
              >
                <View
                  className={`flex-row items-start gap-3 ${
                    index < breakdown.items.length - 1 ? 'border-b border-white/5 pb-3' : ''
                  }`}
                >
                  <View
                    className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: getChartColor(index) }}
                  />
                  <View className="min-w-0 flex-1 gap-1">
                    <View className="flex-row flex-wrap items-center gap-1.5">
                      <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                        {item.genre}
                      </Text>
                      <View className="rounded-full bg-surface px-2 py-0.5">
                        <Text className="text-[10px] font-semibold text-subtle">{count}件</Text>
                      </View>
                      <Text className="text-[10px] text-subtle">
                        {Math.round(item.percentage * 100)}%
                      </Text>
                    </View>
                    {summary ? (
                      <Text className="text-xs text-subtle" numberOfLines={2}>
                        {summary}
                      </Text>
                    ) : null}
                    {count > 1 ? (
                      <Text className="text-[10px] text-subtle">
                        平均 {formatPrice(scaleGenreAmount(average, period), breakdown.currency)}
                      </Text>
                    ) : null}
                  </View>
                  <Text className="shrink-0 text-sm font-bold text-foreground">
                    {formatPrice(displayAmount, breakdown.currency)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </AnalyticsCard>

      <AnalyticsCard>
        <Text className="text-xs text-subtle">{periodLabel}合計</Text>
        <Text className="mt-1 text-2xl font-bold text-foreground">
          {formatPrice(totalAmount, breakdown.currency)}
        </Text>
      </AnalyticsCard>

      <GenreDetailModal
        item={selectedGenre}
        currency={breakdown.currency}
        period={period}
        onClose={() => setSelectedGenre(null)}
      />
    </AnalyticsSection>
  );
};

interface GenreDetailModalProps {
  item: GenreSpendingItem | null;
  currency: string;
  period: GenreAmountPeriod;
  onClose: () => void;
}

function GenreDetailModal({ item, currency, period, onClose }: GenreDetailModalProps) {
  return (
    <Modal visible={item != null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/60" onPress={onClose}>
        <Pressable
          className="max-h-[70%] rounded-t-3xl bg-card px-5 pb-8 pt-5"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="mb-4 text-lg font-bold text-foreground">{item?.genre ?? ''}</Text>
          <ScrollView className="max-h-80">
            {item?.subscriptions.map((sub) => (
              <View
                key={sub.id}
                className="flex-row items-center justify-between border-b border-white/5 py-3"
              >
                <Text className="flex-1 text-sm text-foreground" numberOfLines={1}>
                  {sub.serviceName}
                </Text>
                <Text className="text-sm font-semibold text-foreground">
                  {formatPrice(scaleGenreAmount(sub.amount, period), currency)}
                </Text>
              </View>
            ))}
          </ScrollView>
          <Pressable
            onPress={onClose}
            className="mt-4 items-center rounded-2xl bg-surface py-3"
            accessibilityRole="button"
            accessibilityLabel="閉じる"
          >
            <Text className="text-sm font-bold text-foreground">閉じる</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
