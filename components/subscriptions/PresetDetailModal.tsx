import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Calendar as CalendarIcon } from 'lucide-react-native';
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
import { formatBillingDate, getBillingCycleLabel } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import type { PresetPlan, PresetService } from '@/src/domain/preset';

import { resolveServiceLogo } from './serviceLogos';

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
    setIsCalendarOpen(false);
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

            <Text className="pb-3 pt-7 text-base font-bold text-foreground">支払い開始日</Text>
            <View className="rounded-2xl bg-card">
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={isSubmitting}
                onPress={() => setIsCalendarOpen((prev) => !prev)}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center gap-3">
                  <CalendarIcon size={20} color={AppColors.accent} />
                  <Text className="text-[15px] font-bold text-foreground">
                    {formatBillingDate(startDate)}
                  </Text>
                </View>
                <MaterialIcons
                  name={isCalendarOpen ? 'expand-less' : 'expand-more'}
                  size={24}
                  color={AppColors.subtle}
                />
              </TouchableOpacity>
              {isCalendarOpen ? (
                <View className="border-t border-border px-4 pb-4 pt-3">
                  <MiniDatePicker
                    value={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                      setIsCalendarOpen(false);
                    }}
                  />
                </View>
              ) : null}
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

const DAYS_OF_WEEK = ['月', '火', '水', '木', '金', '土', '日'];

interface MiniDatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
}

/**
 * 月表示のシンプルな日付ピッカー。外部依存を増やさず支払い開始日を選べるようにする。
 */
const MiniDatePicker: React.FC<MiniDatePickerProps> = ({ value, onChange }) => {
  const [viewDate, setViewDate] = useState(() => new Date(value.getFullYear(), value.getMonth(), 1));

  // 選択日が変わったら表示月も追従させる（リセット時など）。
  useEffect(() => {
    setViewDate(new Date(value.getFullYear(), value.getMonth(), 1));
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const today = new Date();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const cells = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = new Date(year, month, 1).getDay();
    const leading = firstWeekday === 0 ? 6 : firstWeekday - 1;

    const result: (number | null)[] = [];
    for (let i = 0; i < leading; i++) {
      result.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(d);
    }
    while (result.length % 7 !== 0) {
      result.push(null);
    }
    return result;
  }, [year, month]);

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  return (
    <View>
      <View className="mb-2 flex-row items-center justify-between">
        <TouchableOpacity onPress={goPrevMonth} hitSlop={8} className="px-2 py-1">
          <MaterialIcons name="chevron-left" size={24} color={AppColors.accent} />
        </TouchableOpacity>
        <Text className="text-[15px] font-semibold text-foreground">
          {year}年 {month + 1}月
        </Text>
        <TouchableOpacity onPress={goNextMonth} hitSlop={8} className="px-2 py-1">
          <MaterialIcons name="chevron-right" size={24} color={AppColors.accent} />
        </TouchableOpacity>
      </View>

      <View className="flex-row">
        {DAYS_OF_WEEK.map((day, index) => (
          <View key={day} className="flex-1 items-center py-1">
            <Text
              className={`text-xs font-medium ${index >= 5 ? 'text-weekend' : 'text-muted'}`}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} className="aspect-square w-[14.285%]" />;
          }
          const cellDate = new Date(year, month, day);
          const isSelected = isSameDay(cellDate, value);
          const isToday = isSameDay(cellDate, today);
          return (
            <TouchableOpacity
              key={day}
              activeOpacity={0.7}
              onPress={() => {
                void Haptics.selectionAsync();
                onChange(cellDate);
              }}
              className="aspect-square w-[14.285%] items-center justify-center p-0.5"
            >
              <View
                className={`h-9 w-9 items-center justify-center rounded-full ${
                  isSelected ? 'bg-accent' : ''
                }`}
              >
                <Text
                  className={`text-[15px] ${
                    isSelected
                      ? 'font-bold text-foreground'
                      : isToday
                        ? 'font-bold text-accent'
                        : index % 7 >= 5
                          ? 'text-weekend'
                          : 'text-foreground'
                  }`}
                >
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
