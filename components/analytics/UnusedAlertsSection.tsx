import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { AnalyticsCard } from '@/components/analytics/AnalyticsCard';
import { AnalyticsSection } from '@/components/analytics/AnalyticsSection';
import { ServiceLogoBadge } from '@/components/analytics/ServiceLogoBadge';
import { ContractPriceText } from '@/components/currency/ContractPriceText';
import { getMonthlyNormalizedPrice } from '@/src/domain/normalizeBilling';
import type { UnusedSubscriptionAlert } from '@/src/domain/unusedSubscriptions';

interface UnusedAlertsSectionProps {
  alerts: UnusedSubscriptionAlert[];
  title?: string;
  badge?: string;
}

export const UnusedAlertsSection: React.FC<UnusedAlertsSectionProps> = ({
  alerts,
  title = '見直し候補',
  badge,
}) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <AnalyticsSection
      title={title}
      subtitle={`${alerts.length}件のサブスクがしばらく使われていません`}
      badge={badge ?? `${alerts.length}件`}
    >
      <View className="gap-2">
        {alerts.map((alert) => (
          <UnusedAlertCard key={alert.subscription.id} alert={alert} />
        ))}
      </View>
    </AnalyticsSection>
  );
};

function UnusedAlertCard({ alert }: { alert: UnusedSubscriptionAlert }) {
  const router = useRouter();
  const { subscription, lastUsedDate, daysSinceLastUse } = alert;
  const monthlyAmount = getMonthlyNormalizedPrice(subscription);

  const subtitle = useMemo(() => {
    if (lastUsedDate == null) {
      return '利用記録なし';
    }
    return `最終利用 ${lastUsedDate.replace(/-/g, '/')}`;
  }, [lastUsedDate]);

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/subscriptions/${subscription.id}`)}
      accessibilityRole="button"
      accessibilityLabel={`${subscription.service.name}を見直す`}
    >
      <AnalyticsCard className="flex-row items-center gap-3 py-3">
        <ServiceLogoBadge
          name={subscription.service.name}
          logoKey={subscription.service.logoKey}
          logoUri={subscription.service.logoUri}
        />

        <View className="min-w-0 flex-1 gap-1">
          <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
            {subscription.service.name}
          </Text>
          <Text className="text-xs text-subtle">{subtitle}</Text>
          <View className="self-start rounded-full bg-accent-brand/15 px-2 py-0.5">
            <Text className="text-[11px] font-semibold text-accent-brand">
              {daysSinceLastUse != null ? `${daysSinceLastUse}日間未利用` : '未利用'}
            </Text>
          </View>
        </View>

        <ContractPriceText
          amount={monthlyAmount}
          currency={subscription.plan.currency}
          className="text-sm font-bold text-foreground"
        />
      </AnalyticsCard>
    </Pressable>
  );
}
