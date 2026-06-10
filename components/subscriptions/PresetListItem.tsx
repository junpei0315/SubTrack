import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { getBillingCycleLabel } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import { getRepresentativeMonthlyPlan, type PresetService } from '@/src/domain/preset';

import { resolveServiceLogo } from './serviceLogos';

interface PresetListItemProps {
  preset: PresetService;
  onPress?: (preset: PresetService) => void;
}

const CYCLE_SUFFIX: Record<string, string> = {
  monthly: '月',
  yearly: '年',
  weekly: '週',
};

export const PresetListItem: React.FC<PresetListItemProps> = ({ preset, onPress }) => {
  const plan = getRepresentativeMonthlyPlan(preset);
  const logoSource = resolveServiceLogo(preset.logoKey, preset.logoUri);
  const initial = preset.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      className="flex-row items-center gap-3.5 rounded-2xl bg-card p-3.5"
      activeOpacity={0.7}
      onPress={() => onPress?.(preset)}
    >
      <View className="h-11 w-11 overflow-hidden rounded-[10px]">
        {logoSource ? (
          <Image source={logoSource} className="h-full w-full" contentFit="cover" />
        ) : (
          <View className="h-full w-full items-center justify-center bg-surface">
            <Text className="text-lg font-bold text-foreground">{initial}</Text>
          </View>
        )}
      </View>

      <View className="flex-1 gap-0.5">
        <Text className="text-base font-bold text-foreground" numberOfLines={1}>
          {preset.name}
        </Text>
        <Text className="text-[13px] text-subtle" numberOfLines={1}>
          {preset.genre}
        </Text>
      </View>

      {plan ? (
        <Text className="text-[15px] font-bold text-accent">
          {formatPrice(plan.price, plan.currency)}
          <Text className="text-[13px] font-semibold text-accent">
            {' '}
            / {CYCLE_SUFFIX[plan.cycle] ?? getBillingCycleLabel(plan.cycle)}
          </Text>
        </Text>
      ) : null}
    </TouchableOpacity>
  );
};
