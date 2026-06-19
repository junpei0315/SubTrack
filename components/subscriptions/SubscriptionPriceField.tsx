import React from 'react';
import { Text, TextInput, View } from 'react-native';

import { AppColors } from '@/constants/colors';
import { getBillingCycleLabel, type BillingCycle } from '@/src/domain/billingCycle';

const CYCLE_SUFFIX: Record<BillingCycle, string> = {
  monthly: '月',
  yearly: '年',
  weekly: '週',
};

interface SubscriptionPriceFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  cycle: BillingCycle;
  currency?: string;
  editable?: boolean;
  helperText?: string;
  changedHint?: string;
}

export const SubscriptionPriceField: React.FC<SubscriptionPriceFieldProps> = ({
  value,
  onChangeText,
  cycle,
  currency = 'JPY',
  editable = true,
  helperText = '実際の料金を入力してください',
  changedHint,
}) => {
  return (
    <>
      <View className="pb-3 pt-7">
        <Text className="text-base font-bold text-foreground">料金</Text>
        {helperText ? <Text className="pt-1 text-[13px] text-subtle">{helperText}</Text> : null}
      </View>
      <View
        className={`flex-row items-center rounded-2xl border bg-card px-4 ${
          changedHint ? 'border-accent' : 'border-border'
        }`}
      >
        <Text className="text-xl font-bold text-subtle">
          {currency === 'JPY' ? '\u00a5' : currency}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={AppColors.mutedDark}
          className="flex-1 border-0 py-4 pl-2 text-xl font-bold text-foreground outline-none"
          selectionColor={AppColors.accent}
          underlineColorAndroid="transparent"
        />
        <Text className="text-sm font-semibold text-subtle">
          / {CYCLE_SUFFIX[cycle] ?? getBillingCycleLabel(cycle)}
        </Text>
      </View>
      {changedHint ? <Text className="pt-2 text-[13px] text-accent">{changedHint}</Text> : null}
    </>
  );
};
