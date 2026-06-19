import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

import { GenreBreakdownSection } from '@/components/analytics/GenreBreakdownSection';
import { SpendingTrendSection } from '@/components/analytics/SpendingTrendSection';
import { UnusedAlertsSection } from '@/components/analytics/UnusedAlertsSection';
import { useAnalytics } from '@/components/analytics/useAnalytics';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';

// 関連機能: F-06（ジャンル別内訳） / F-07（支出推移） / F-11（未使用アラート）
export default function AnalyticsRoute() {
  const { genreBreakdown, spendingTrend, unusedAlerts, isLoading, errorMessage, reload } =
    useAnalytics();

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="grow pb-8"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={AppColors.accent} />
      }
    >
      <ThemedView className="flex-1 gap-8 px-4 pb-4 pt-2">
        {isLoading && genreBreakdown == null ? (
          <View className="items-center py-16">
            <ActivityIndicator color={AppColors.accent} />
          </View>
        ) : errorMessage ? (
          <Text className="text-sm text-accent">{errorMessage}</Text>
        ) : (
          <>
            <UnusedAlertsSection alerts={unusedAlerts} />
            <GenreBreakdownSection breakdown={genreBreakdown} />
            <SpendingTrendSection trend={spendingTrend} />
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}
