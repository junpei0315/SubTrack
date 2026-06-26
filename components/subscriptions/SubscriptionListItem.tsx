import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { ContractPriceText } from '@/components/currency/ContractPriceText';
import { formatBillingDate, getBillingCycleLabel } from '@/src/domain/billingCycle';
import type { Subscription } from '@/src/domain/subscription';
import { getEffectiveSubscriptionPrice } from '@/src/domain/subscriptionPrice';
import { formatTrialEndsOnLabel, isInTrial } from '@/src/domain/trialPeriod';

import { resolveServiceLogo } from './serviceLogos';

interface SubscriptionListItemProps {
  subscription: Subscription;
  onPress?: (subscription: Subscription) => void;
}

export const SubscriptionListItem: React.FC<SubscriptionListItemProps> = ({
  subscription,
  onPress,
}) => {
  const { service, plan, nextBillingDate, status, cancelledAt } = subscription;
  const isPaused = status === 'paused';
  const isCancelled = status === 'cancelled';
  const inTrial = isInTrial(subscription);
  const isDimmed = isPaused || isCancelled;
  const initial = service.name.charAt(0).toUpperCase();
  const logoSource = resolveServiceLogo(service.logoKey, service.logoUri);

  return (
    <View
      className={`flex-row items-center gap-3.5 rounded-2xl bg-card p-3.5${isDimmed ? ' opacity-50' : ''}`}
    >
      <TouchableOpacity
        className="min-w-0 flex-1 flex-row items-center gap-3.5"
        activeOpacity={0.7}
        onPress={() => onPress?.(subscription)}
      >
        <View className="h-12 w-12 overflow-hidden rounded-xl">
          {logoSource ? (
            <Image source={logoSource} className="h-full w-full" contentFit="cover" />
          ) : (
            <View className="h-full w-full items-center justify-center bg-surface">
              <Text className="text-xl font-bold text-foreground">{initial}</Text>
            </View>
          )}
        </View>

        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-base font-bold text-foreground" numberOfLines={1}>
            {service.name}
          </Text>
          <Text className="text-[13px] text-subtle" numberOfLines={1}>
            {plan.name}
          </Text>
          <Text className="mt-0.5 text-xs text-subtle">
            {inTrial
              ? `お試し終了 ${subscription.trialEndsOn ? formatTrialEndsOnLabel(subscription.trialEndsOn) : '—'}`
              : isCancelled
                ? `解約 ${cancelledAt ? formatBillingDate(cancelledAt) : '済み'}`
                : `次回 ${formatBillingDate(nextBillingDate)}`}
          </Text>
        </View>
      </TouchableOpacity>

      <View className="items-end gap-0.5">
        <ContractPriceText
          amount={getEffectiveSubscriptionPrice(subscription)}
          currency={plan.currency}
          className="text-base font-bold text-foreground"
        />
        <Text className="text-xs font-semibold text-accent">{getBillingCycleLabel(plan.cycle)}</Text>
        {inTrial ? (
          <View className="mt-0.5 rounded-full bg-[rgba(255,159,10,0.15)] px-2 py-0.5">
            <Text className="text-[11px] font-semibold text-[#ffb84d]">お試し中</Text>
          </View>
        ) : null}
        {isPaused ? <Text className="mt-0.5 text-[11px] text-subtle">停止中</Text> : null}
        {isCancelled ? <Text className="mt-0.5 text-[11px] text-subtle">解約済み</Text> : null}
      </View>
    </View>
  );
}
