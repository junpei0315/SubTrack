import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppColors } from '@/constants/colors';
import { getBillingCycleLabel } from '@/src/domain/billingCycle';
import type { Subscription } from '@/src/domain/subscription';
import { getEffectiveSubscriptionPrice } from '@/src/domain/subscriptionPrice';
import type { PriceChangeScope } from '@/src/domain/subscriptionPriceHistory';
import { normalizeSubscriptionPrice } from '@/src/domain/subscriptionPriceHistory';

import { PriceChangeScopeField } from './PriceChangeScopeField';
import { SubscriptionPriceField } from './SubscriptionPriceField';
import { SubscriptionStartDateField } from './SubscriptionStartDateField';

export interface SubscriptionEditFormValues {
  price: number;
  startDate: Date;
  nextBillingDate: Date;
  priceChangeScope: PriceChangeScope;
}

interface SubscriptionEditFormProps {
  subscription: Subscription;
  isSubmitting?: boolean;
  onSubmit: (values: SubscriptionEditFormValues) => void;
}

function pricesEqualNormalized(a: number, b: number): boolean {
  return normalizeSubscriptionPrice(a) === normalizeSubscriptionPrice(b);
}

export function SubscriptionEditForm({
  subscription,
  isSubmitting = false,
  onSubmit,
}: SubscriptionEditFormProps) {
  const initialPrice = getEffectiveSubscriptionPrice(subscription);
  const [priceText, setPriceText] = useState(String(initialPrice));
  const [startDate, setStartDate] = useState(subscription.startDate);
  const [nextBillingDate, setNextBillingDate] = useState(subscription.nextBillingDate);
  const [priceChangeScope, setPriceChangeScope] = useState<PriceChangeScope>('from_current_month');
  const [showPriceError, setShowPriceError] = useState(false);

  const parsedPrice = Number(priceText.replace(/[^0-9.]/g, ''));
  const isPriceValid = priceText.trim().length > 0 && !Number.isNaN(parsedPrice) && parsedPrice >= 0;
  const priceChanged = isPriceValid && !pricesEqualNormalized(parsedPrice, initialPrice);
  const canSubmit = isPriceValid && !isSubmitting;

  const priceErrorMessage = useMemo(() => {
    if (!showPriceError || isPriceValid) {
      return null;
    }
    return '0以上の数値を入力してください';
  }, [showPriceError, isPriceValid]);

  const handleSubmit = () => {
    setShowPriceError(!isPriceValid);
    if (!canSubmit) {
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit({
      price: parsedPrice,
      startDate,
      nextBillingDate,
      priceChangeScope: priceChanged ? priceChangeScope : 'all_time',
    });
  };

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-6 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1">
          <Text className="text-xl font-bold text-foreground">{subscription.service.name}</Text>
          <Text className="text-sm text-subtle">{subscription.plan.name}</Text>
          <Text className="text-sm font-semibold text-accent">
            {getBillingCycleLabel(subscription.plan.cycle)}
          </Text>
        </View>

        <SubscriptionPriceField
          value={priceText}
          onChangeText={(text) => {
            setPriceText(text);
            if (text.trim().length > 0) {
              setShowPriceError(false);
            }
          }}
          cycle={subscription.plan.cycle}
          editable={!isSubmitting}
        />
        {priceErrorMessage ? (
          <Text className="pt-2 text-[13px] text-accent">{priceErrorMessage}</Text>
        ) : null}

        {priceChanged ? (
          <PriceChangeScopeField
            value={priceChangeScope}
            onChange={setPriceChangeScope}
            disabled={isSubmitting}
          />
        ) : null}

        <SubscriptionStartDateField
          value={startDate}
          onChange={setStartDate}
          disabled={isSubmitting}
          label="支払い開始日"
        />

        <SubscriptionStartDateField
          value={nextBillingDate}
          onChange={setNextBillingDate}
          disabled={isSubmitting}
          label="次回更新日"
        />
      </ScrollView>

      <View className="border-t border-border px-5 pb-7 pt-3">
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={!canSubmit}
          onPress={handleSubmit}
          className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
            canSubmit ? 'bg-accent' : 'bg-white/[0.08]'
          }`}
        >
          {isSubmitting ? <ActivityIndicator color={AppColors.text} size="small" /> : null}
          <Text className={`text-base font-bold ${canSubmit ? 'text-foreground' : 'text-subtle'}`}>
            {isSubmitting ? '保存中...' : '変更を保存'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
