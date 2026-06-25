import { useRouter } from 'expo-router';
import { BookOpen, Coffee, PiggyBank, Sparkles, UtensilsCrossed } from 'lucide-react-native';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { ServiceLogoBadge } from '@/components/analytics/ServiceLogoBadge';
import { useExchangeRates } from '@/components/currency/ExchangeRateProvider';
import { AppColors } from '@/constants/colors';
import { formatPrice } from '@/src/domain/money';
import {
  computeSavingsInsight,
  type SavingsInsight,
  type SpendingEquivalent,
  type SpendingEquivalentKind,
} from '@/src/domain/savingsInsight';
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
    return computeSavingsInsight(unusedAlerts, rates);
  }, [unusedAlerts, rates]);

  if (!insight) {
    return null;
  }

  if (insight.monthlyAmountJpy <= 0) {
    return <NoSavingsCard hasUsageLogs={hasUsageLogs} />;
  }

  return <SavingsCard insight={insight} hasUsageLogs={hasUsageLogs} />;
};

function NoSavingsCard({ hasUsageLogs }: { hasUsageLogs: boolean }) {
  return (
    <AnalyticsCard>
      <Text className="text-base font-bold text-foreground">見直しで浮く金額</Text>
      <Text className="mt-1 text-sm text-subtle">
        {hasUsageLogs
          ? '今のところ、見直し候補はありません。'
          : '登録から一定期間経過したサブスクのうち、見直し候補は今のところありません。'}
      </Text>
    </AnalyticsCard>
  );
}

function SavingsCard({
  insight,
  hasUsageLogs,
}: {
  insight: SavingsInsight;
  hasUsageLogs: boolean;
}) {
  const router = useRouter();
  const topItems = insight.items.slice(0, 3);

  return (
    <AnalyticsCard variant="accent" className="gap-5">
      <View className="flex-row items-center gap-2">
        <View className="rounded-full bg-accent-brand/20 p-2">
          <Sparkles size={16} color={AppColors.accentBrand} />
        </View>
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-base font-bold text-foreground">見直しで浮きそうな金額</Text>
          <Text className="text-xs text-subtle">
            {hasUsageLogs
              ? 'しばらく使っていないサブスクの合計'
              : '利用記録がないサブスクの合計'}
          </Text>
        </View>
      </View>

      <View className="gap-1">
        <Text className="text-[40px] font-bold leading-tight text-foreground">
          {formatPrice(insight.monthlyAmountJpy, 'JPY')}
          <Text className="text-lg font-semibold text-subtle"> / 月</Text>
        </Text>
        <Text className="text-sm text-subtle">
          年間で約 {formatPrice(insight.yearlyAmountJpy, 'JPY')}
        </Text>
      </View>

      {insight.equivalents.length > 0 ? (
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
            他に使うとしたら
          </Text>
          <View className="gap-2">
            {insight.equivalents.map((equivalent) => (
              <EquivalentRow key={equivalent.description} equivalent={equivalent} />
            ))}
          </View>
        </View>
      ) : null}

      {topItems.length > 0 ? (
        <View className="gap-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted">
            主な内訳
          </Text>
          <View className="gap-2">
            {topItems.map((item) => (
              <Pressable
                key={item.subscriptionId}
                onPress={() => router.push(`/subscriptions/${item.subscriptionId}`)}
                className="flex-row items-center gap-3 rounded-2xl bg-surface/80 px-3 py-2.5 active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel={`${item.serviceName}の詳細を見る`}
              >
                <ServiceLogoBadge
                  name={item.serviceName}
                  logoKey={item.logoKey}
                  logoUri={item.logoUri}
                  size="sm"
                />
                <Text className="min-w-0 flex-1 text-sm font-semibold text-foreground" numberOfLines={1}>
                  {item.serviceName}
                </Text>
                <Text className="text-sm font-bold text-foreground">
                  {formatPrice(item.monthlyAmountJpy, 'JPY')}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}
    </AnalyticsCard>
  );
}

function EquivalentRow({ equivalent }: { equivalent: SpendingEquivalent }) {
  const Icon = EQUIVALENT_ICONS[equivalent.kind];

  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-surface/80 px-3 py-2.5">
      <View className="rounded-full bg-accent-brand/15 p-2">
        <Icon size={14} color={AppColors.accentBrand} />
      </View>
      <Text className="flex-1 text-sm text-foreground">{equivalent.description}</Text>
    </View>
  );
}

const EQUIVALENT_ICONS: Record<
  SpendingEquivalentKind,
  React.ComponentType<{ size?: number; color?: string }>
> = {
  coffee: Coffee,
  lunch: UtensilsCrossed,
  book: BookOpen,
  savings: PiggyBank,
};
