import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ContractPriceText } from '@/components/currency/ContractPriceText';
import { resolveServiceLogo } from '@/components/subscriptions/serviceLogos';
import { getMonthlyNormalizedPrice } from '@/src/domain/normalizeBilling';
import type { UnusedSubscriptionAlert } from '@/src/domain/unusedSubscriptions';

interface UnusedAlertsSectionProps {
  alerts: UnusedSubscriptionAlert[];
}

export const UnusedAlertsSection: React.FC<UnusedAlertsSectionProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <View className="gap-3">
      <View className="gap-1">
        <Text className="text-base font-bold text-foreground">見直し推奨</Text>
        <Text className="text-sm text-subtle">
          {alerts.length}件のサブスクがしばらく利用されていません
        </Text>
      </View>

      <View className="gap-2">
        {alerts.map((alert) => (
          <UnusedAlertCard key={alert.subscription.id} alert={alert} />
        ))}
      </View>
    </View>
  );
};

function UnusedAlertCard({ alert }: { alert: UnusedSubscriptionAlert }) {
  const router = useRouter();
  const { subscription, lastUsedDate, daysSinceLastUse } = alert;
  const monthlyAmount = getMonthlyNormalizedPrice(subscription);
  const logoSource = resolveServiceLogo(
    subscription.service.logoKey,
    subscription.service.logoUri
  );
  const initial = subscription.service.name.charAt(0).toUpperCase();

  const subtitle = useMemo(() => {
    if (lastUsedDate == null) {
      return '利用記録なし';
    }
    return `最終利用: ${lastUsedDate.replace(/-/g, '/')}`;
  }, [lastUsedDate]);

  return (
    <Pressable
      onPress={() => router.push(`/subscriptions/${subscription.id}`)}
      className="flex-row items-center gap-3 rounded-2xl border border-[rgba(220,5,45,0.35)] bg-card px-4 py-3 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`${subscription.service.name}を見直す`}
    >
      <View className="h-11 w-11 overflow-hidden rounded-xl bg-surface">
        {logoSource ? (
          <Image source={logoSource} className="h-full w-full" contentFit="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-base font-bold text-foreground">{initial}</Text>
          </View>
        )}
      </View>

      <View className="min-w-0 flex-1 gap-0.5">
        <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
          {subscription.service.name}
        </Text>
        <Text className="text-xs text-subtle">{subtitle}</Text>
        <Text className="text-xs text-accent">
          {daysSinceLastUse != null ? `${daysSinceLastUse}日間未利用` : '未利用'}
        </Text>
      </View>

      <ContractPriceText
        amount={monthlyAmount}
        currency={subscription.plan.currency}
        className="text-sm font-semibold text-foreground"
      />
    </Pressable>
  );
}
