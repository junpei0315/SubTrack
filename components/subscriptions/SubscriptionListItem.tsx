import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { formatBillingDate, getBillingCycleLabel } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import type { Subscription } from '@/src/domain/subscription';

interface SubscriptionListItemProps {
  subscription: Subscription;
  onPress?: (subscription: Subscription) => void;
}

export const SubscriptionListItem: React.FC<SubscriptionListItemProps> = ({
  subscription,
  onPress,
}) => {
  const { service, plan, nextBillingDate, status } = subscription;
  const isPaused = status === 'paused';
  const initial = service.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      className={`flex-row items-center gap-3.5 rounded-2xl bg-card p-3.5${isPaused ? ' opacity-50' : ''}`}
      activeOpacity={0.7}
      onPress={() => onPress?.(subscription)}
    >
      <View className="h-12 w-12 overflow-hidden rounded-xl">
        {service.logoUri ? (
          <Image source={{ uri: service.logoUri }} className="h-full w-full" contentFit="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center bg-surface">
            <Text className="text-xl font-bold text-foreground">{initial}</Text>
          </View>
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-base font-bold text-foreground" numberOfLines={1}>
          {service.name}
        </Text>
        <Text className="text-[13px] text-subtle" numberOfLines={1}>
          {plan.name}
        </Text>
        <Text className="mt-0.5 text-xs text-subtle">
          次回 {formatBillingDate(nextBillingDate)}
        </Text>
      </View>

      <View className="items-end gap-0.5">
        <Text className="text-base font-bold text-foreground">{formatPrice(plan.price, plan.currency)}</Text>
        <Text className="text-xs font-semibold text-accent">{getBillingCycleLabel(plan.cycle)}</Text>
        {isPaused ? <Text className="mt-0.5 text-[11px] text-subtle">停止中</Text> : null}
      </View>
    </TouchableOpacity>
  );
};
