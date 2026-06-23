import React, { useMemo, useState } from 'react';
import { Pressable, Text, type TextProps } from 'react-native';

import { DISPLAY_CURRENCY, formatDisplayPrice } from '@/src/domain/exchangeRate';
import { formatPrice } from '@/src/domain/money';

import { useExchangeRates } from './ExchangeRateProvider';

interface ContractPriceTextProps extends TextProps {
  amount: number;
  currency: string;
  /** 外貨のときタップで円換算表示に切り替え可能にする（既定: true） */
  toggleable?: boolean;
}

/**
 * 個別サブスク等の価格表示。
 * 既定は契約通貨。JPY 以外はタップで円換算表示に切り替えられる。
 */
export function ContractPriceText({
  amount,
  currency,
  toggleable = true,
  className,
  ...textProps
}: ContractPriceTextProps) {
  const { rates } = useExchangeRates();
  const [showJpy, setShowJpy] = useState(false);
  const isForeign = currency !== DISPLAY_CURRENCY;
  const canToggle = toggleable && isForeign;

  const label = useMemo(() => {
    if (!isForeign || !showJpy) {
      return formatPrice(amount, currency);
    }
    return formatDisplayPrice(amount, currency, rates);
  }, [amount, currency, isForeign, rates, showJpy]);

  const accessibilityLabel = canToggle
    ? showJpy
      ? `${label}、タップで契約通貨表示に戻す`
      : `${label}、タップで円換算表示に切り替え`
    : label;

  if (!canToggle) {
    return (
      <Text className={className} accessibilityLabel={accessibilityLabel} {...textProps}>
        {label}
      </Text>
    );
  }

  return (
    <Pressable
      onPress={() => setShowJpy((prev) => !prev)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
    >
      <Text className={className} {...textProps}>
        {label}
      </Text>
    </Pressable>
  );
}
