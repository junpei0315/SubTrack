import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { getChartColor } from '@/components/analytics/chartColors';
import { DonutChart } from '@/components/analytics/DonutChart';
import { formatPrice } from '@/src/domain/money';
import type { GenreSpendingBreakdown, GenreSpendingItem } from '@/src/domain/spendingByGenre';

interface GenreBreakdownSectionProps {
  breakdown: GenreSpendingBreakdown | null;
}

export const GenreBreakdownSection: React.FC<GenreBreakdownSectionProps> = ({ breakdown }) => {
  const [selectedGenre, setSelectedGenre] = useState<GenreSpendingItem | null>(null);

  const segments = useMemo(
    () =>
      (breakdown?.items ?? []).map((item) => ({
        key: item.genre,
        value: item.amount,
        percentage: item.percentage,
      })),
    [breakdown]
  );

  if (!breakdown || breakdown.items.length === 0) {
    return (
      <View className="gap-2">
        <Text className="text-base font-bold text-foreground">ジャンル別の支出</Text>
        <Text className="text-sm text-subtle">契約中のサブスクがありません</Text>
      </View>
    );
  }

  return (
    <View className="gap-4">
      <View className="gap-1">
        <Text className="text-base font-bold text-foreground">ジャンル別の支出</Text>
        <Text className="text-sm text-subtle">月額換算での内訳</Text>
      </View>

      <View className="items-center">
        <DonutChart segments={segments} />
        <Text className="mt-3 text-2xl font-bold text-foreground">
          {formatPrice(breakdown.totalMonthlyAmount, breakdown.currency)}
        </Text>
        <Text className="text-xs text-subtle">月額換算合計</Text>
      </View>

      <View className="gap-2">
        {breakdown.items.map((item, index) => (
          <Pressable
            key={item.genre}
            onPress={() => setSelectedGenre(item)}
            className="flex-row items-center justify-between rounded-2xl bg-card px-4 py-3 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel={`${item.genre} ${Math.round(item.percentage * 100)}パーセント`}
          >
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              <View
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: getChartColor(index) }}
              />
              <Text className="flex-1 text-sm font-semibold text-foreground" numberOfLines={1}>
                {item.genre}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-sm font-bold text-foreground">
                {formatPrice(item.amount, breakdown.currency)}
              </Text>
              <Text className="text-xs text-subtle">{Math.round(item.percentage * 100)}%</Text>
            </View>
          </Pressable>
        ))}
      </View>

      <GenreDetailModal
        item={selectedGenre}
        currency={breakdown.currency}
        onClose={() => setSelectedGenre(null)}
      />
    </View>
  );
};

interface GenreDetailModalProps {
  item: GenreSpendingItem | null;
  currency: string;
  onClose: () => void;
}

function GenreDetailModal({ item, currency, onClose }: GenreDetailModalProps) {
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
                  {formatPrice(sub.amount, currency)}
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
