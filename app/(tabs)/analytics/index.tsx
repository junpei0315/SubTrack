import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

import { AnalyticsSummaryTab } from '@/components/analytics/AnalyticsSummaryTab';
import { AnalyticsTabBar, type AnalyticsTab } from '@/components/analytics/AnalyticsTabBar';
import { GenreBreakdownSection } from '@/components/analytics/GenreBreakdownSection';
import { SpendingTrendSection } from '@/components/analytics/SpendingTrendSection';
import { useAnalytics } from '@/components/analytics/useAnalytics';
import { useExchangeRates } from '@/components/currency/ExchangeRateProvider';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';

// 関連機能: F-06（ジャンル別内訳） / F-07（支出推移） / F-11（未使用アラート）
export default function AnalyticsRoute() {
  const hasFocusedRef = useRef(false);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('summary');
  const { genreBreakdown, spendingTrend, subscriptions, unusedAlerts, hasUsageLogs, isLoading, errorMessage, reload } =
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
      <ThemedView className="flex-1 gap-5 px-4 pb-4 pt-2">
        <AnalyticsTabBar activeTab={activeTab} onTabChange={setActiveTab} />

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

            {activeTab === 'summary' ? (
              <AnalyticsSummaryTab
                genreBreakdown={genreBreakdown}
                unusedAlerts={unusedAlerts}
                hasUsageLogs={hasUsageLogs}
              />
            ) : null}

            {activeTab === 'genre' ? <GenreBreakdownSection breakdown={genreBreakdown} /> : null}

            {activeTab === 'trend' ? (
              <SpendingTrendSection trend={spendingTrend} subscriptions={subscriptions} />
            ) : null}
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}
