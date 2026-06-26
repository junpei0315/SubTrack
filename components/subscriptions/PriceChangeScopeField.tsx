import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { PriceChangeScope } from '@/src/domain/subscriptionPriceHistory';

interface PriceChangeScopeFieldProps {
  value: PriceChangeScope;
  onChange: (value: PriceChangeScope) => void;
  disabled?: boolean;
}

const OPTIONS: { value: PriceChangeScope; title: string; description: string }[] = [
  {
    value: 'all_time',
    title: '過去も含めてすべて',
    description: '支出推移や合計の過去月も新しい料金で再計算します',
  },
  {
    value: 'from_current_month',
    title: '今月から',
    description: '過去月はこれまでの料金のまま、今月以降だけ新しい料金を使います',
  },
];

export function PriceChangeScopeField({
  value,
  onChange,
  disabled = false,
}: PriceChangeScopeFieldProps) {
  return (
    <View className="gap-2">
      <Text className="pb-1 pt-2 text-base font-bold text-foreground">料金の反映方法</Text>
      {OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-4 ${
              selected ? 'border-accent bg-accent/10' : 'border-border bg-card'
            }`}
          >
            <Text className={`text-base font-bold ${selected ? 'text-accent' : 'text-foreground'}`}>
              {option.title}
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-subtle">{option.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
