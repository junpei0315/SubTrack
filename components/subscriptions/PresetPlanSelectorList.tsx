import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { MarqueeText } from '@/components/ui/MarqueeText';
import { AppColors } from '@/constants/colors';
import { getBillingCycleLabel } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import type { PresetPlan } from '@/src/domain/preset';

const CYCLE_SUFFIX: Record<string, string> = {
  monthly: '月',
  yearly: '年',
  weekly: '週',
};

function cycleLabel(cycle: PresetPlan['cycle']): string {
  return CYCLE_SUFFIX[cycle] ?? getBillingCycleLabel(cycle);
}

interface PresetPlanSelectorListProps {
  plans: PresetPlan[];
  selectedPlanId: string | null;
  disabled?: boolean;
  onSelectPlan: (plan: PresetPlan) => void;
}

/** プリセットのプラン選択一覧。長いプラン名は選択中のみ横スクロール表示。 */
export const PresetPlanSelectorList: React.FC<PresetPlanSelectorListProps> = ({
  plans,
  selectedPlanId,
  disabled = false,
  onSelectPlan,
}) => (
  <View className="gap-2.5">
    {plans.map((plan) => {
      const isSelected = plan.id === selectedPlanId;
      return (
        <TouchableOpacity
          key={plan.id}
          activeOpacity={0.8}
          disabled={disabled}
          onPress={() => {
            void Haptics.selectionAsync();
            onSelectPlan(plan);
          }}
          className={`flex-row items-center justify-between rounded-2xl border p-4 ${
            isSelected ? 'border-accent bg-accent/10' : 'border-border bg-card'
          }`}
        >
          <View className="flex-1 flex-row items-center gap-3">
            <View
              className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                isSelected ? 'border-accent bg-accent' : 'border-border-muted'
              }`}
            >
              {isSelected ? <MaterialIcons name="check" size={12} color={AppColors.text} /> : null}
            </View>
            <MarqueeText text={plan.name} active={isSelected} className="flex-1" />
          </View>
          <Text className="pl-3 text-[15px] font-bold text-foreground">
            {formatPrice(plan.price, plan.currency)}
            <Text className="text-[13px] font-semibold text-subtle">
              {' '}
              / {cycleLabel(plan.cycle)}
            </Text>
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
