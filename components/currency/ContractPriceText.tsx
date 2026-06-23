import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View, type TextProps } from 'react-native';

import { AppColors } from '@/constants/colors';
import { DISPLAY_CURRENCY, formatDisplayPrice } from '@/src/domain/exchangeRate';
import { formatPrice, getCurrencySymbol } from '@/src/domain/money';

import { useExchangeRates } from './ExchangeRateProvider';

interface ContractPriceTextProps extends TextProps {
  amount: number;
  currency: string;
  /** 外貨のときタップで円換算表示に切り替え可能にする（既定: true） */
  toggleable?: boolean;
  /** ヒント行の揃え（一覧は end、詳細は start） */
  align?: 'start' | 'end';
}

function currencyToggleHint(currency: string): string {
  return `タップで${getCurrencySymbol(currency)}表示`;
}

/**
 * 個別サブスク等の価格表示。
 * 既定は契約通貨。JPY 以外はタップで円換算表示に切り替えられる。
 */
export function ContractPriceText({
  amount,
  currency,
  toggleable = true,
  align = 'end',
  className,
  ...textProps
}: ContractPriceTextProps) {
  const { rates, isLoading } = useExchangeRates();
  const [showJpy, setShowJpy] = useState(false);
  const isForeign = currency !== DISPLAY_CURRENCY;
  const canToggle = toggleable && isForeign;

  const label = useMemo(() => {
    if (!isForeign || !showJpy) {
      return formatPrice(amount, currency);
    }
    if (isLoading && rates == null) {
      return '換算中…';
    }
    return formatDisplayPrice(amount, currency, rates);
  }, [amount, currency, isForeign, isLoading, rates, showJpy]);

  const jpyToggleHint = currencyToggleHint(DISPLAY_CURRENCY);
  const contractToggleHint = currencyToggleHint(currency);
  const toggleHint = showJpy ? contractToggleHint : jpyToggleHint;

  const accessibilityLabel = canToggle
    ? showJpy
      ? `${label}、${contractToggleHint}`
      : `${label}、${jpyToggleHint}`
    : label;

  const alignClass = align === 'start' ? 'items-start' : 'items-end';

  if (!canToggle) {
    return (
      <Text className={className} accessibilityLabel={accessibilityLabel} {...textProps}>
        {label}
      </Text>
    );
  }

  return (
    <Pressable
      onPress={(event) => {
        event.stopPropagation?.();
        setShowJpy((prev) => !prev);
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      className={alignClass}
    >
      <View className={`flex-row items-center gap-0.5 ${align === 'end' ? 'justify-end' : ''}`}>
        <Text className={className} {...textProps}>
          {label}
        </Text>
        <MaterialIcons name="swap-horiz" size={13} color={AppColors.mutedDark} />
      </View>
      <Text className="mt-0.5 text-[10px] text-subtle">{toggleHint}</Text>
    </Pressable>
  );
}
