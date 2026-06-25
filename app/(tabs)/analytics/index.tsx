import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

import { GenreBreakdownSection } from '@/components/analytics/GenreBreakdownSection';
import { SavingsPotentialSection } from '@/components/analytics/SavingsPotentialSection';
import { SpendingTrendSection } from '@/components/analytics/SpendingTrendSection';
import { UnusedAlertsSection } from '@/components/analytics/UnusedAlertsSection';
import { useAnalytics } from '@/components/analytics/useAnalytics';
import { useExchangeRates } from '@/components/currency/ExchangeRateProvider';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';

// 関連機能: F-06（ジャンル別内訳） / F-07（支出推移） / F-11（未使用アラート）
export default function AnalyticsRoute() {
  const hasFocusedRef = useRef(false);
  const { genreBreakdown, spendingTrend, unusedAlerts, hasUsageLogs, isLoading, errorMessage, reload } =
    useAnalytics();
  const { staleMessage } = useExchangeRates();

  useFocusEffect(
    useCallback(() => {
      if (hasFocusedRef.current) {
        void reload();
        return;
      }
      hasFocusedRef.current = true;
    }, [reload])
  );

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="grow pb-10"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={AppColors.accent} />
      }
    >
      <ThemedView className="flex-1 gap-8 px-4 pb-4 pt-3">
        <View className="gap-1">
          <Text className="text-2xl font-bold text-foreground">分析</Text>
          <Text className="text-sm text-subtle">支出の内訳と、見直しで浮く余地をチェック</Text>
        </View>

        {isLoading && genreBreakdown == null ? (
          <View className="items-center py-16">
            <ActivityIndicator color={AppColors.accent} />
          </View>
        ) : errorMessage ? (
          <Text className="text-sm text-accent">{errorMessage}</Text>
        ) : (
          <>
            {staleMessage ? (
              <View className="rounded-full bg-surface px-3 py-2">
                <Text className="text-xs text-subtle">{staleMessage}</Text>
              </View>
            ) : null}
            <SavingsPotentialSection
              unusedAlerts={unusedAlerts}
              hasUsageLogs={hasUsageLogs}
            />
            <UnusedAlertsSection alerts={unusedAlerts} />
            <GenreBreakdownSection breakdown={genreBreakdown} />
            <SpendingTrendSection trend={spendingTrend} />
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}
