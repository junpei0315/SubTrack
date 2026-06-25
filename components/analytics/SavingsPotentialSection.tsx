import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useExchangeRates } from '@/components/currency/ExchangeRateProvider';
import { formatPrice } from '@/src/domain/money';
import { computeSavingsInsight, type SavingsInsight } from '@/src/domain/savingsInsight';
import type { UnusedSubscriptionAlert } from '@/src/domain/unusedSubscriptions';

interface SavingsPotentialSectionProps {
  unusedAlerts: UnusedSubscriptionAlert[];
  hasUsageLogs: boolean;
}

export const SavingsPotentialSection: React.FC<SavingsPotentialSectionProps> = ({
  unusedAlerts,
  hasUsageLogs,
}) => {
  const { rates } = useExchangeRates();

  const insight = useMemo<SavingsInsight | null>(() => {
    if (!rates) {
      return null;
    }
    return computeSavingsInsight(unusedAlerts, rates, hasUsageLogs);
  }, [unusedAlerts, rates, hasUsageLogs]);

  if (!insight) {
    return null;
  }

  if (!insight.hasUsageLogs) {
    return <UsageTrackingPrompt />;
  }

  if (insight.monthlyAmountJpy <= 0) {
    return <NoSavingsCard />;
  }

  return <SavingsCard insight={insight} />;
};

function UsageTrackingPrompt() {
  const router = useRouter();

  return (
    <View className="gap-2 rounded-2xl border border-border bg-card px-4 py-4">
      <Text className="text-base font-bold text-foreground">見直しで浮く金額</Text>
      <Text className="text-sm leading-5 text-subtle">
        サブスク詳細で「使った」を記録すると、見直しで浮きそうな金額を提案できます。
      </Text>
      <Pressable
        onPress={() => router.push('/subscriptions')}
        className="mt-1 self-start rounded-full bg-surface px-4 py-2 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel="サブスクリプション一覧を開く"
      >
        <Text className="text-sm font-semibold text-foreground">サブスク一覧へ</Text>
      </Pressable>
    </View>
  );
}

function NoSavingsCard() {
  return (
    <View className="gap-1 rounded-2xl border border-border bg-card px-4 py-4">
      <Text className="text-base font-bold text-foreground">見直しで浮く金額</Text>
      <Text className="text-sm text-subtle">今のところ、見直し候補はありません。</Text>
    </View>
  );
}

function SavingsCard({ insight }: { insight: SavingsInsight }) {
  const topItems = insight.items.slice(0, 3);

  return (
    <View className="gap-4 rounded-2xl border border-[rgba(220,5,45,0.25)] bg-card px-4 py-4">
      <View className="gap-1">
        <Text className="text-base font-bold text-foreground">見直しで浮きそうな金額</Text>
        <Text className="text-xs text-subtle">しばらく使っていないサブスクを見直した場合の目安です</Text>
      </View>

      <View className="gap-1">
        <Text className="text-[32px] font-bold text-foreground">
          月 {formatPrice(insight.monthlyAmountJpy, 'JPY')}
        </Text>
        <Text className="text-sm text-subtle">
          年間で約 {formatPrice(insight.yearlyAmountJpy, 'JPY')}
        </Text>
      </View>

      {insight.equivalents.length > 0 ? (
        <View className="gap-1.5 rounded-xl bg-surface px-3 py-3">
          <Text className="text-xs font-semibold text-muted">他に使うとしたら</Text>
          {insight.equivalents.map((equivalent) => (
            <Text key={equivalent.description} className="text-sm text-foreground">
              {equivalent.description}
            </Text>
          ))}
        </View>
      ) : null}

      {topItems.length > 0 ? (
        <View className="gap-2">
          <Text className="text-xs font-semibold text-muted">内訳（上位）</Text>
          {topItems.map((item) => (
            <View key={item.subscriptionId} className="flex-row items-center justify-between gap-3">
              <Text className="min-w-0 flex-1 text-sm text-foreground" numberOfLines={1}>
                {item.serviceName}
              </Text>
              <Text className="text-sm font-semibold text-foreground">
                {formatPrice(item.monthlyAmountJpy, 'JPY')}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
