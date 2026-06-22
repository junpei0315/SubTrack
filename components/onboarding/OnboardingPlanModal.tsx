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
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { resolveServiceLogo } from '@/components/subscriptions/serviceLogos';
import { PresetPlanSelectorList } from '@/components/subscriptions/PresetPlanSelectorList';
import { SubscriptionStartDateField } from '@/components/subscriptions/SubscriptionStartDateField';
import { AppColors } from '@/constants/colors';
import type { PresetService } from '@/src/domain/preset';

interface OnboardingPlanSelection {
  planId: string;
  startDate: Date;
}

interface OnboardingPlanModalProps {
  preset: PresetService | null;
  visible: boolean;
  selectedPlanId: string | null;
  selectedStartDate?: Date | null;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (selection: OnboardingPlanSelection | null) => void;
}

/**
 * 初回オンボーディング用のプラン選択ボトムシート。
 * プラン一覧はスクロールし、確定ボタンは常に下部に固定する。
 */
export const OnboardingPlanModal: React.FC<OnboardingPlanModalProps> = ({
  preset,
  visible,
  selectedPlanId,
  selectedStartDate = null,
  isSubmitting = false,
  onClose,
  onConfirm,
}) => {
  const insets = useSafeAreaInsets();
  const [localSelectedId, setLocalSelectedId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date>(() => new Date());

  useEffect(() => {
    if (!visible) {
      return;
    }
    const defaultPlanId = selectedPlanId ?? preset?.plans[0]?.id ?? null;
    setLocalSelectedId(defaultPlanId);
    setStartDate(selectedStartDate ?? new Date());
  }, [visible, selectedPlanId, selectedStartDate, preset]);

  const plans = preset?.plans ?? [];
  const initial = preset?.name.charAt(0).toUpperCase() ?? '';
  const logoSource = preset ? resolveServiceLogo(preset.logoKey, preset.logoUri) : undefined;

  const canConfirm = preset != null && !isSubmitting;
  const canClear = localSelectedId != null && !isSubmitting;

  const selectedPlan = useMemo(
    () => (preset ? preset.plans.find((p) => p.id === localSelectedId) ?? null : null),
    [preset, localSelectedId]
  );

  if (!preset) {
    return null;
  }

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
        <Pressable className="absolute inset-0 bg-black/60" onPress={isSubmitting ? undefined : onClose} />

        <View className="h-[85%] flex-col overflow-hidden rounded-t-3xl bg-background-darker">
          <View className="items-center pt-3">
            <View className="h-1.5 w-12 rounded-full bg-white/20" />
          </View>

          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 pb-4 pt-4"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-14 w-14 overflow-hidden rounded-2xl">
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

            <Text className="pb-3 pt-6 text-base font-bold text-foreground">プランを選択</Text>
            <PresetPlanSelectorList
              plans={plans}
              selectedPlanId={localSelectedId}
              disabled={isSubmitting}
              onSelectPlan={(plan) => setLocalSelectedId(plan.id)}
            />

            {localSelectedId != null ? (
              <SubscriptionStartDateField
                value={startDate}
                onChange={setStartDate}
                disabled={isSubmitting}
              />
            ) : null}
          </ScrollView>

          <View
            className="gap-2 border-t border-border bg-background-darker px-5 pt-3"
            style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
          >
            {localSelectedId != null ? (
              <TouchableOpacity
                activeOpacity={0.85}
                disabled={!canClear}
                onPress={() => {
                  void Haptics.selectionAsync();
                  setLocalSelectedId(null);
                  onConfirm(null);
                }}
                className="flex-row items-center justify-center rounded-full bg-white/[0.08] py-3.5"
              >
                <Text className="text-sm font-semibold text-foreground">選択を解除</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!canConfirm}
              onPress={() => {
                void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onConfirm(
                  localSelectedId != null ? { planId: localSelectedId, startDate } : null
                );
              }}
              className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
                canConfirm ? 'bg-accent' : 'bg-white/[0.08]'
              }`}
            >
              {isSubmitting ? <ActivityIndicator color={AppColors.text} size="small" /> : null}
              <Text className={`text-base font-bold ${canConfirm ? 'text-foreground' : 'text-subtle'}`}>
                {isSubmitting ? '反映中...' : selectedPlan ? 'このプランにする' : '閉じる'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
