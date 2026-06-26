import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnalyticsSummaryTab } from '@/components/analytics/AnalyticsSummaryTab';
import { AnalyticsTabBar, type AnalyticsTab } from '@/components/analytics/AnalyticsTabBar';
import { GenreBreakdownSection } from '@/components/analytics/GenreBreakdownSection';
import { SpendingTrendSection } from '@/components/analytics/SpendingTrendSection';
import { useAnalytics } from '@/components/analytics/useAnalytics';
import { useExchangeRates } from '@/components/currency/ExchangeRateProvider';
import { AppColors } from '@/constants/colors';

/** タブバーとコンテンツの間（固定） */
const CONTENT_TOP_GAP = 8;

// 関連機能: F-06（ジャンル別内訳） / F-07（支出推移） / F-11（未使用アラート）
export default function AnalyticsRoute() {
  const insets = useSafeAreaInsets();
  const hasFocusedRef = useRef(false);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('summary');
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
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

  const handlePullRefresh = useCallback(async () => {
    setIsPullRefreshing(true);
    try {
      await reload();
    } finally {
      setIsPullRefreshing(false);
    }
  }, [reload]);

  const showInitialLoader = isLoading && genreBreakdown == null;

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pb-0 pt-1">
        <AnalyticsTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: CONTENT_TOP_GAP,
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 40,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isPullRefreshing}
            onRefresh={handlePullRefresh}
            tintColor={AppColors.accent}
          />
        }
      >
        <View className="gap-5">
          {showInitialLoader ? (
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
        </View>
      </ScrollView>
    </View>
  );
}
