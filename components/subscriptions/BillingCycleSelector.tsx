import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { getBillingCycleLabel, type BillingCycle } from '@/src/domain/billingCycle';

const CYCLES: BillingCycle[] = ['monthly', 'yearly', 'weekly'];

interface BillingCycleSelectorProps {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
  disabled?: boolean;
}

export const BillingCycleSelector: React.FC<BillingCycleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <View className="flex-row gap-2">
      {CYCLES.map((cycle) => {
        const isSelected = cycle === value;
        return (
          <TouchableOpacity
            key={cycle}
            activeOpacity={0.8}
            disabled={disabled}
            onPress={() => onChange(cycle)}
            className={`flex-1 items-center justify-center rounded-2xl border py-3.5 ${
              isSelected ? 'border-accent bg-accent/10' : 'border-border bg-card'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${isSelected ? 'text-foreground' : 'text-subtle'}`}
            >
              {getBillingCycleLabel(cycle)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
