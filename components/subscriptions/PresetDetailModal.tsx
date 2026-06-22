import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  type LayoutChangeEvent,
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

import { resolveServiceLogo } from './serviceLogos';
import { SubscriptionStartDateField } from './SubscriptionStartDateField';

export interface PresetSelection {
  preset: PresetService;
  plan: PresetPlan;
  /** ユーザーが編集後の実際の料金（プリセット価格から変更可能） */
  price: number;
  startDate: Date;
}

interface PresetDetailModalProps {
  preset: PresetService | null;
  visible: boolean;
  isSubmitting?: boolean;
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
  onClose,
  onConfirm,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [priceText, setPriceText] = useState('');
  const [startDate, setStartDate] = useState<Date>(() => new Date());

  const selectedPlan = useMemo(
    () => preset?.plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [preset, selectedPlanId]
  );

  // モーダルを開くたびに初期状態へ戻す（最初のプランを選択、開始日は今日）。
  useEffect(() => {
    if (!visible || !preset) {
      return;
    }
    const firstPlan = preset.plans[0] ?? null;
    setSelectedPlanId(firstPlan?.id ?? null);
    setPriceText(firstPlan ? String(firstPlan.price) : '');
    setStartDate(new Date());
  }, [visible, preset]);

  if (!preset) {
    return null;
  }

  const logoSource = resolveServiceLogo(preset.logoKey, preset.logoUri);
  const initial = preset.name.charAt(0).toUpperCase();
  const currency = selectedPlan?.currency ?? preset.plans[0]?.currency ?? 'JPY';

  const handleSelectPlan = (plan: PresetPlan) => {
    void Haptics.selectionAsync();
    setSelectedPlanId(plan.id);
    setPriceText(String(plan.price));
  };

  const parsedPrice = Number(priceText.replace(/[^0-9.]/g, ''));
  const isPriceValid = priceText.trim().length > 0 && !Number.isNaN(parsedPrice) && parsedPrice >= 0;
  const priceChanged = selectedPlan != null && isPriceValid && parsedPrice !== selectedPlan.price;
  const canConfirm = selectedPlan != null && isPriceValid && !isSubmitting;

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
            <View className="gap-2.5">
              {preset.plans.map((plan) => {
                const isSelected = plan.id === selectedPlanId;
                return (
                  <TouchableOpacity
                    key={plan.id}
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                    onPress={() => handleSelectPlan(plan)}
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
                        {isSelected ? (
                          <MaterialIcons name="check" size={12} color={AppColors.text} />
                        ) : null}
                      </View>
                      <MarqueeText
                        text={plan.name}
                        active={isSelected}
                        className="flex-1 text-[15px] font-semibold text-foreground"
                      />
                    </View>
                    <Text className="pl-3 text-[15px] font-bold text-foreground">
                      {formatPrice(plan.price, plan.currency)}
                      <Text className="text-[13px] font-semibold text-subtle">
                        {' '}
                        / {CYCLE_SUFFIX[plan.cycle] ?? getBillingCycleLabel(plan.cycle)}
                      </Text>
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

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

interface MarqueeTextProps {
  text: string;
  /** はみ出している場合に自動スクロールを開始する（選択中のプランのみ true 想定） */
  active: boolean;
  className?: string;
}

const MARQUEE_TEXT_STYLE = {
  color: AppColors.text,
  fontSize: 15,
  fontWeight: '600',
} as const;

/**
 * テキストがコンテナ幅をはみ出した場合に左右へ往復スクロールして全体を読めるようにする。
 */
const MarqueeText: React.FC<MarqueeTextProps> = ({ text, active, className }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const runIdRef = useRef(0);

  const overflow = textWidth - containerWidth;
  const shouldScroll = active && overflow > 1 && containerWidth > 0;

  useEffect(() => {
    const runId = ++runIdRef.current;
    translateX.stopAnimation();
    translateX.setValue(0);

    if (!shouldScroll) {
      return;
    }

    const duration = Math.max(overflow * 35, 1500);

    const runCycle = () => {
      if (runIdRef.current !== runId) {
        return;
      }
      translateX.setValue(0);
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(translateX, {
          toValue: -overflow,
          duration,
          easing: Easing.linear,
          useNativeDriver: false,
        }),
        Animated.delay(900),
      ]).start(({ finished }) => {
        if (finished && runIdRef.current === runId) {
          runCycle();
        }
      });
    };
    runCycle();

    return () => {
      runIdRef.current += 1;
      translateX.stopAnimation();
      translateX.setValue(0);
    };
  }, [shouldScroll, overflow, translateX]);

  const handleContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const handleTextLayout = (event: LayoutChangeEvent) => {
    setTextWidth(event.nativeEvent.layout.width);
  };

  return (
    <View className={className} style={{ overflow: 'hidden' }} onLayout={handleContainerLayout}>
      <Animated.View
        style={{ alignSelf: 'flex-start', flexDirection: 'row', transform: [{ translateX }] }}
      >
        <Text numberOfLines={1} onLayout={handleTextLayout} style={MARQUEE_TEXT_STYLE}>
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};
