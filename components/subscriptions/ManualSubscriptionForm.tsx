import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppColors } from '@/constants/colors';
import type { BillingCycle } from '@/src/domain/billingCycle';

import { BillingCycleSelector } from './BillingCycleSelector';
import { SubscriptionPriceField } from './SubscriptionPriceField';
import { SubscriptionStartDateField } from './SubscriptionStartDateField';
import { TrialPeriodFields, type TrialPeriodValue } from './TrialPeriodFields';

export interface ManualSubscriptionFormValues {
  serviceName: string;
  planName: string;
  cycle: BillingCycle;
  price: number;
  startDate: Date;
  trialEndsOn?: Date;
}

interface ManualSubscriptionFormProps {
  isSubmitting?: boolean;
  onSubmit: (values: ManualSubscriptionFormValues) => void;
}

export const ManualSubscriptionForm: React.FC<ManualSubscriptionFormProps> = ({
  isSubmitting = false,
  onSubmit,
}) => {
  const [serviceName, setServiceName] = useState('');
  const [planName, setPlanName] = useState('');
  const [cycle, setCycle] = useState<BillingCycle>('monthly');
  const [priceText, setPriceText] = useState('');
  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [trialPeriod, setTrialPeriod] = useState<TrialPeriodValue>({
    enabled: false,
    trialEndsOn: null,
  });
  const [showServiceError, setShowServiceError] = useState(false);
  const [showPriceError, setShowPriceError] = useState(false);

  const initial = serviceName.trim().charAt(0).toUpperCase() || '?';
  const parsedPrice = Number(priceText.replace(/[^0-9.]/g, ''));
  const isPriceValid = priceText.trim().length > 0 && !Number.isNaN(parsedPrice) && parsedPrice >= 0;
  const isServiceValid = serviceName.trim().length > 0;
  const canSubmit = isServiceValid && isPriceValid && !isSubmitting;

  const priceErrorMessage = useMemo(() => {
    if (!showPriceError || isPriceValid) {
      return null;
    }
    return '0以上の数値を入力してください';
  }, [showPriceError, isPriceValid]);

  const handleSubmit = () => {
    setShowServiceError(!isServiceValid);
    setShowPriceError(!isPriceValid);
    if (!canSubmit) {
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit({
      serviceName: serviceName.trim(),
      planName: planName.trim(),
      cycle,
      price: parsedPrice,
      startDate,
      trialEndsOn: trialPeriod.enabled ? trialPeriod.trialEndsOn ?? undefined : undefined,
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
        <View className="flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-surface">
            <Text className="text-2xl font-bold text-foreground">{initial}</Text>
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-xl font-bold text-foreground">カスタム登録</Text>
            <Text className="text-sm text-subtle">プリセットにないサービスを追加</Text>
          </View>
        </View>

        <Text className="pb-2 pt-7 text-base font-bold text-foreground">サービス名</Text>
        <TextInput
          value={serviceName}
          onChangeText={(text) => {
            setServiceName(text);
            if (text.trim().length > 0) {
              setShowServiceError(false);
            }
          }}
          editable={!isSubmitting}
          placeholder="例: 地域のジム"
          placeholderTextColor={AppColors.mutedDark}
          className={`rounded-2xl border bg-card px-4 py-4 text-base text-foreground outline-none ${
            showServiceError && !isServiceValid ? 'border-accent' : 'border-border'
          }`}
          selectionColor={AppColors.accent}
          underlineColorAndroid="transparent"
        />
        {showServiceError && !isServiceValid ? (
          <Text className="pt-2 text-[13px] text-accent">サービス名を入力してください</Text>
        ) : null}

        <Text className="pb-2 pt-7 text-base font-bold text-foreground">プラン名（任意）</Text>
        <Text className="pb-2 text-[13px] text-subtle">未入力の場合は「標準」として登録します</Text>
        <TextInput
          value={planName}
          onChangeText={setPlanName}
          editable={!isSubmitting}
          placeholder="例: スタンダード"
          placeholderTextColor={AppColors.mutedDark}
          className="rounded-2xl border border-border bg-card px-4 py-4 text-base text-foreground outline-none"
          selectionColor={AppColors.accent}
          underlineColorAndroid="transparent"
        />

        <Text className="pb-3 pt-7 text-base font-bold text-foreground">請求サイクル</Text>
        <BillingCycleSelector value={cycle} onChange={setCycle} disabled={isSubmitting} />

        <SubscriptionPriceField
          value={priceText}
          onChangeText={(text) => {
            setPriceText(text);
            if (text.trim().length > 0) {
              setShowPriceError(false);
            }
          }}
          cycle={cycle}
          editable={!isSubmitting}
        />
        {priceErrorMessage ? (
          <Text className="pt-2 text-[13px] text-accent">{priceErrorMessage}</Text>
        ) : null}

        <SubscriptionStartDateField
          value={startDate}
          onChange={setStartDate}
          disabled={isSubmitting}
        />

        <View className="pt-4">
          <TrialPeriodFields
            startDate={startDate}
            value={trialPeriod}
            onChange={setTrialPeriod}
            disabled={isSubmitting}
          />
        </View>
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
            {isSubmitting ? '登録中...' : 'この内容で追加'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
