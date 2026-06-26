import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { ServiceLogoBadge } from '@/components/analytics/ServiceLogoBadge';
import { useSubscriptionList } from '@/components/subscriptions/useSubscriptionList';
import { formatBillingDate, getBillingCycleLabel } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import type { Subscription } from '@/src/domain/subscription';
import { getEffectiveSubscriptionPrice } from '@/src/domain/subscriptionPrice';
import {
  daysUntilTrialEnds,
  getUpcomingTrialEnds,
  isInTrial,
} from '@/src/domain/trialPeriod';

export const UpcomingTrials: React.FC = () => {
  const { subscriptions, isLoading } = useSubscriptionList();
  const router = useRouter();

  const upcoming = useMemo(
    () => getUpcomingTrialEnds(subscriptions, { limit: 5 }),
    [subscriptions]
  );

  if (isLoading && subscriptions.length === 0) {
    return null;
  }

  if (upcoming.length === 0) {
    return null;
  }

  return (
    <View className="mb-4 gap-3 self-stretch">
      <View className="gap-0.5">
        <Text className="text-lg font-bold text-foreground">お試し終了が近い</Text>
        <Text className="text-sm text-subtle">課金が始まる前に見直しましょう</Text>
      </View>

      <View className="gap-2">
        {upcoming.map((subscription) => (
          <TrialCard
            key={subscription.id}
            subscription={subscription}
            onPress={() => router.push(`/(tabs)/subscriptions/${subscription.id}`)}
          />
        ))}
      </View>
    </View>
  );
};

function TrialCard({
  subscription,
  onPress,
}: {
  subscription: Subscription;
  onPress: () => void;
}) {
  const remaining = daysUntilTrialEnds(subscription);
  const price = getEffectiveSubscriptionPrice(subscription);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-2xl border border-[rgba(255,159,10,0.35)] bg-card px-4 py-3 active:opacity-80"
      accessibilityRole="button"
      accessibilityLabel={`${subscription.service.name}のお試し終了`}
    >
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
          終了 {subscription.trialEndsOn ? formatBillingDate(subscription.trialEndsOn) : '—'}
        </Text>
      </View>
      <View className="items-end gap-0.5">
        <View className="rounded-full bg-[rgba(255,159,10,0.15)] px-2 py-0.5">
          <Text className="text-[11px] font-semibold text-[#ffb84d]">
            {remaining != null ? `あと${remaining}日` : 'お試し中'}
          </Text>
        </View>
        <Text className="text-xs text-subtle">
          以降 {formatPrice(price, subscription.plan.currency)} /{' '}
          {getBillingCycleLabel(subscription.plan.cycle).replace('毎', '')}
        </Text>
      </View>
    </Pressable>
  );
}

export function hasActiveTrials(subscriptions: readonly Subscription[]): boolean {
  return subscriptions.some((subscription) => isInTrial(subscription));
}
