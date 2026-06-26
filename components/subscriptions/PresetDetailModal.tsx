import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AppColors } from '@/constants/colors';
import { getBillingCycleLabel } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import type { PresetPlan, PresetService } from '@/src/domain/preset';
import { findFirstAvailablePlan } from '@/src/domain/registeredPlanIds';

import { PresetPlanSelectorList } from './PresetPlanSelectorList';
import { resolveServiceLogo } from './serviceLogos';
import { SubscriptionStartDateField } from './SubscriptionStartDateField';
import {
  TrialPeriodFields,
  createInitialTrialPeriodValue,
  type TrialPeriodValue,
} from './TrialPeriodFields';

export interface PresetSelection {
  preset: PresetService;
  plan: PresetPlan;
  /** ユーザーが編集後の実際の料金（プリセット価格から変更可能） */
  price: number;
  startDate: Date;
  trialEndsOn?: Date;
}

interface PresetDetailModalProps {
  preset: PresetService | null;
  visible: boolean;
  isSubmitting?: boolean;
  /** 契約一覧の取得が成功し、登録済み判定が信頼できる状態か。 */
  registeredPlanIdsReady?: boolean;
  registeredPlanIds?: ReadonlySet<string>;
  onClose: () => void;
  onConfirm: (selection: PresetSelection) => void;
}

const CYCLE_SUFFIX: Record<string, string> = {
  monthly: '月',
  yearly: '年',
  weekly: '週',
};

/**
 * プリセット選択時に表示するボトムシート型モーダル。
 * F-01（プリセット選択で一括登録）: ロゴ・サービス名・プラン一覧・支払い開始日を表示し、
 * プランを選ぶと料金（プリセット価格）を必要に応じて編集できる。
 */
export const PresetDetailModal: React.FC<PresetDetailModalProps> = ({
  preset,
  visible,
  isSubmitting = false,
  registeredPlanIdsReady = true,
  registeredPlanIds,
  onClose,
  onConfirm,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [priceText, setPriceText] = useState('');
  const [startDate, setStartDate] = useState<Date>(() => new Date());
  const [trialPeriod, setTrialPeriod] = useState<TrialPeriodValue>(() =>
    createInitialTrialPeriodValue(new Date())
  );

  const selectedPlan = useMemo(
    () => preset?.plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [preset, selectedPlanId]
  );

  // モーダルを開いた／別プリセットに切り替えたときだけフォームを初期化する。
  useEffect(() => {
    if (!visible || !preset) {
      return;
    }
    const registered = registeredPlanIds ?? new Set<string>();
    const firstPlan = findFirstAvailablePlan(preset.plans, registered);
    setSelectedPlanId(firstPlan?.id ?? null);
    setPriceText(firstPlan ? String(firstPlan.price) : '');
    const nextStartDate = new Date();
    setStartDate(nextStartDate);
    setTrialPeriod(
      createInitialTrialPeriodValue(nextStartDate, firstPlan?.defaultTrialDays)
    );
  }, [visible, preset?.id]);

  // 登録状況の後追い反映: 現在の選択が登録済みになった場合のみ差し替える。
  useEffect(() => {
    if (!visible || !preset || !registeredPlanIds || !selectedPlanId) {
      return;
    }
    if (!registeredPlanIds.has(selectedPlanId)) {
      return;
    }
    const fallback = findFirstAvailablePlan(preset.plans, registeredPlanIds);
    setSelectedPlanId(fallback?.id ?? null);
    setPriceText(fallback ? String(fallback.price) : '');
    setTrialPeriod(
      createInitialTrialPeriodValue(startDate, fallback?.defaultTrialDays)
    );
  }, [visible, preset, registeredPlanIds, selectedPlanId, startDate]);

  if (!preset) {
    return null;
  }

  const logoSource = resolveServiceLogo(preset.logoKey, preset.logoUri);
  const initial = preset.name.charAt(0).toUpperCase();
  const currency = selectedPlan?.currency ?? preset.plans[0]?.currency ?? 'JPY';

  const handleSelectPlan = (plan: PresetPlan) => {
    if (registeredPlanIds?.has(plan.id)) {
      return;
    }
    setSelectedPlanId(plan.id);
    setPriceText(String(plan.price));
    setTrialPeriod(createInitialTrialPeriodValue(startDate, plan.defaultTrialDays));
  };

  const parsedPrice = Number(priceText.replace(/[^0-9.]/g, ''));
  const isPriceValid = priceText.trim().length > 0 && !Number.isNaN(parsedPrice) && parsedPrice >= 0;
  const priceChanged = selectedPlan != null && isPriceValid && parsedPrice !== selectedPlan.price;
  const isSelectedPlanRegistered =
    selectedPlan != null && (registeredPlanIds?.has(selectedPlan.id) ?? false);
  const canConfirm =
    registeredPlanIdsReady &&
    selectedPlan != null &&
    isPriceValid &&
    !isSubmitting &&
    !isSelectedPlanRegistered;

  const handleConfirm = () => {
    if (!selectedPlan || !isPriceValid) {
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onConfirm({
      preset,
      plan: selectedPlan,
      price: parsedPrice,
      startDate,
      trialEndsOn: trialPeriod.enabled ? trialPeriod.trialEndsOn ?? undefined : undefined,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-black/60"
          onPress={isSubmitting ? undefined : onClose}
        />

        <View className="h-[94%] overflow-hidden rounded-t-3xl bg-background-darker">
          <View className="items-center pt-3">
            <View className="h-1.5 w-12 rounded-full bg-white/20" />
          </View>

          <ScrollView
            contentContainerClassName="px-5 pb-6 pt-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="flex-row items-center gap-4">
              <View className="h-16 w-16 overflow-hidden rounded-2xl">
                {logoSource ? (
                  <Image source={logoSource} className="h-full w-full" contentFit="cover" />
                ) : (
                  <View className="h-full w-full items-center justify-center bg-surface">
                    <Text className="text-2xl font-bold text-foreground">{initial}</Text>
                  </View>
                )}
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
                  {preset.name}
                </Text>
                <Text className="text-sm text-subtle" numberOfLines={1}>
                  {preset.genre}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                disabled={isSubmitting}
                hitSlop={8}
                className="h-9 w-9 items-center justify-center rounded-full bg-white/[0.08]"
              >
                <MaterialIcons name="close" size={20} color={AppColors.subtle} />
              </TouchableOpacity>
            </View>

            <Text className="pb-3 pt-7 text-base font-bold text-foreground">プランを選択</Text>
            <PresetPlanSelectorList
              plans={preset.plans}
              selectedPlanId={selectedPlanId}
              disabled={isSubmitting}
              registeredPlanIds={registeredPlanIds}
              onSelectPlan={handleSelectPlan}
            />

            <View className="pb-3 pt-7">
              <Text className="text-base font-bold text-foreground">料金</Text>
              <Text className="pt-1 text-[13px] text-subtle">
                実際の料金と違う場合はここで変更できます
              </Text>
            </View>
            <View
              className={`flex-row items-center rounded-2xl border bg-card px-4 ${
                priceChanged ? 'border-accent' : 'border-border'
              }`}
            >
              <Text className="text-xl font-bold text-subtle">
                {currency === 'JPY' ? '\u00a5' : currency}
              </Text>
              <TextInput
                value={priceText}
                onChangeText={setPriceText}
                editable={!isSubmitting}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={AppColors.mutedDark}
                className="flex-1 border-0 py-4 pl-2 text-xl font-bold text-foreground outline-none"
                selectionColor={AppColors.accent}
                underlineColorAndroid="transparent"
              />
              <Text className="text-sm font-semibold text-subtle">
                / {selectedPlan ? CYCLE_SUFFIX[selectedPlan.cycle] ?? getBillingCycleLabel(selectedPlan.cycle) : '月'}
              </Text>
            </View>
            {priceChanged && selectedPlan ? (
              <Text className="pt-2 text-[13px] text-accent">
                プリセット価格 {formatPrice(selectedPlan.price, selectedPlan.currency)} から変更されました
              </Text>
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
                defaultTrialDays={selectedPlan?.defaultTrialDays}
                disabled={isSubmitting}
              />
            </View>
          </ScrollView>

          <View className="border-t border-border px-5 pb-7 pt-3">
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!canConfirm}
              onPress={handleConfirm}
              className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
                canConfirm ? 'bg-accent' : 'bg-white/[0.08]'
              }`}
            >
              {isSubmitting ? <ActivityIndicator color={AppColors.text} size="small" /> : null}
              <Text
                className={`text-base font-bold ${canConfirm ? 'text-foreground' : 'text-subtle'}`}
              >
                {isSubmitting ? '登録中...' : 'この内容で追加'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
