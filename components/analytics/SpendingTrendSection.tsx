import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection';
import { BarTrendChart } from '@/components/analytics/BarTrendChart';
import { ServiceLogoBadge } from '@/components/analytics/ServiceLogoBadge';
import { AppColors } from '@/constants/colors';
import { formatBillingDate } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import type { MonthlySpendingTrend } from '@/src/domain/monthlySpendingTrend';
import type { Subscription } from '@/src/domain/subscription';
import { getEffectiveSubscriptionPrice } from '@/src/domain/subscriptionPrice';
import {
  buildSpendingChangeHints,
  computeTrendInsights,
  formatMomComparison,
  formatPeakMonthHint,
} from '@/src/domain/trendInsights';
import { getUpcomingSubscriptions } from '@/src/domain/upcomingSubscriptions';

interface SpendingTrendSectionProps {
  trend: MonthlySpendingTrend | null;
  subscriptions: readonly Subscription[];
}

export const SpendingTrendSection: React.FC<SpendingTrendSectionProps> = ({
  trend,
  subscriptions,
}) => {
  const router = useRouter();
  const today = useMemo(() => new Date(), []);

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

  const insights = useMemo(
    () => (trend ? computeTrendInsights(trend, today) : null),
    [trend, today]
  );

  const momLabel = useMemo(
    () => (trend && insights ? formatMomComparison(insights, trend.currency) : null),
    [trend, insights]
  );

  const peakHint = useMemo(
    () => (trend && insights ? formatPeakMonthHint(insights.peakPoint, trend.currency, today) : null),
    [trend, insights, today]
  );

  const changeHints = useMemo(
    () => (insights ? buildSpendingChangeHints(subscriptions, insights, today) : []),
    [subscriptions, insights, today]
  );

  const upcoming = useMemo(
    () => getUpcomingSubscriptions([...subscriptions], 3),
    [subscriptions]
  );

  if (!trend || points.every((point) => point.amount === 0)) {
    return (
      <AnalyticsSection title="支出の推移">
        <AnalyticsCard>
          <Text className="text-sm text-subtle">表示できる契約データがありません</Text>
        </AnalyticsCard>
      </AnalyticsSection>
    );
  }

  return (
    <AnalyticsSection title="支出の推移">
      <View className="flex-row gap-3">
        <AnalyticsCard className="min-w-0 flex-1 gap-1 py-3">
          <Text className="text-xs font-medium text-subtle">今月の支払い予定額</Text>
          <Text className="text-xl font-bold text-foreground">
            {formatPrice(insights?.currentMonthAmount ?? 0, trend.currency)}
          </Text>
          {momLabel ? <Text className="text-xs text-subtle">{momLabel}</Text> : null}
        </AnalyticsCard>

        <AnalyticsCard className="min-w-0 flex-1 gap-1 py-3">
          <Text className="text-xs font-medium text-subtle">年間ペース</Text>
          <Text className="text-xl font-bold text-foreground">
            {formatPrice(insights?.annualPace ?? 0, trend.currency)}
          </Text>
          <Text className="text-xs text-subtle">今月 × 12 の目安</Text>
        </AnalyticsCard>
      </View>

      {peakHint ? (
        <AnalyticsCard className="bg-surface/60 py-3">
          <Text className="text-sm text-foreground">{peakHint}</Text>
        </AnalyticsCard>
      ) : null}

      {changeHints.length > 0 ? (
        <View className="flex-row flex-wrap gap-2">
          {changeHints.map((hint) => (
            <View key={hint.label} className="rounded-full bg-surface px-3 py-1.5">
              <Text className="text-xs text-foreground">{hint.label}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <AnalyticsCard className="gap-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <BarTrendChart points={points} />
        </ScrollView>

        <View className="flex-row items-center gap-4">
          <LegendDot color={AppColors.accentBrand} label="確定・過去" />
          <LegendDot color="rgba(220, 5, 45, 0.35)" label="想定（未来）" />
        </View>
      </AnalyticsCard>

      <AnalyticsCard className="gap-3">
        <Text className="text-xs font-semibold text-subtle">月別の内訳</Text>
        {trend.points.map((point, index) => (
          <View
            key={`${point.yearMonth.year}-${point.yearMonth.month}`}
            className={`flex-row items-center justify-between py-2 ${
              index < trend.points.length - 1 ? 'border-b border-white/5' : ''
            }`}
          >
            <View className="flex-row items-center gap-2">
              <Text className="text-sm font-semibold text-foreground">{point.label}</Text>
              {point.isProjected ? (
                <Text className="text-[10px] text-subtle">想定</Text>
              ) : null}
            </View>
            <Text className="text-sm font-bold text-foreground">
              {formatPrice(point.amount, trend.currency)}
            </Text>
          </View>
        ))}
      </AnalyticsCard>

      {upcoming.length > 0 ? (
        <View className="gap-3">
          <View className="gap-0.5">
            <Text className="text-lg font-bold text-foreground">今月の支払い予定</Text>
            <Text className="text-sm text-subtle">次回請求が近い順</Text>
          </View>
          <View className="gap-2">
            {upcoming.map((subscription) => (
              <Pressable
                key={subscription.id}
                onPress={() => router.push(`/(tabs)/subscriptions/${subscription.id}`)}
                className="active:opacity-80"
              >
                <AnalyticsCard className="flex-row items-center gap-3 py-3">
                  <ServiceLogoBadge
                    name={subscription.service.name}
                    logoKey={subscription.service.logoKey}
                    logoUri={subscription.service.logoUri}
                    size="sm"
                  />
                  <View className="min-w-0 flex-1 gap-0.5">
                    <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                      {subscription.service.name}
                    </Text>
                    <Text className="text-xs text-subtle">
                      {formatBillingDate(subscription.nextBillingDate)}
                    </Text>
                  </View>
                  <Text className="shrink-0 text-sm font-bold text-foreground">
                    {formatPrice(
                      getEffectiveSubscriptionPrice(subscription),
                      subscription.plan.currency
                    )}
                  </Text>
                </AnalyticsCard>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
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
