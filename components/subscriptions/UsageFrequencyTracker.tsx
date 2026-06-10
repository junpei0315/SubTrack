import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppColors } from '@/constants/colors';
import { formatLocalDate } from '@/src/domain/localDate';
import {
  buildRangeUsageView,
  computeCostPerUseYen,
  formatCostPerUseYen,
  formatUseCount,
  DEFAULT_MONTHS_TO_SHOW,
} from '@/src/domain/usageFrequency';

interface UsageFrequencyTrackerProps {
  usedDateKeys: ReadonlySet<string>;
  monthlyPriceYen: number;
  today?: Date;
  monthsToShow?: number;
  onRecordUsagePress?: () => void;
  onUndoUsagePress?: () => void;
  title?: string;
  className?: string;
}

const CELL_GAP = 4;
const CELL_RADIUS = 3;
const MIN_CELL_SIZE = 10;
const MAX_CELL_SIZE = 20;
// 月曜始まりの行に対応するラベル（月・水・金・日を表示）
const WEEKDAY_LABELS = ['月', '', '水', '', '金', '', '日'];

const PLACEHOLDER = '—';

export const UsageFrequencyTracker: React.FC<UsageFrequencyTrackerProps> = ({
  usedDateKeys,
  monthlyPriceYen,
  today: todayProp,
  monthsToShow = DEFAULT_MONTHS_TO_SHOW,
  onRecordUsagePress,
  onUndoUsagePress,
  title = '利用状況トラッカー',
  className,
}) => {
  const today = useMemo(() => todayProp ?? new Date(), [todayProp]);
  const todayKey = formatLocalDate(today);

  const [anchorYear, setAnchorYear] = useState(today.getFullYear());
  const [anchorMonth, setAnchorMonth] = useState(today.getMonth() + 1);
  const [usedToday, setUsedToday] = useState(usedDateKeys.has(todayKey));
  const [gridWidth, setGridWidth] = useState(0);

  const slideX = useSharedValue(0);
  const slideOpacity = useSharedValue(1);
  const slideDirection = useRef(0);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setUsedToday(usedDateKeys.has(todayKey));
  }, [usedDateKeys, todayKey]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const offset = 28 * slideDirection.current;
    slideX.value = offset;
    slideOpacity.value = 0;
    slideX.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    slideOpacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.ease) });
  }, [anchorYear, anchorMonth, slideX, slideOpacity]);

  const heatmapAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
    opacity: slideOpacity.value,
  }));

  const view = useMemo(
    () =>
      buildRangeUsageView(usedDateKeys, monthlyPriceYen, anchorYear, anchorMonth, monthsToShow, today),
    [usedDateKeys, monthlyPriceYen, anchorYear, anchorMonth, monthsToShow, today]
  );

  const weekCount = view.weeks.length;
  const cellSize = useMemo(() => {
    if (gridWidth <= 0 || weekCount <= 0) {
      return MAX_CELL_SIZE;
    }
    const raw = (gridWidth - CELL_GAP * (weekCount - 1)) / weekCount;
    return Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, Math.floor(raw)));
  }, [gridWidth, weekCount]);

  const usesDelta = (usedToday ? 1 : 0) - (view.isUsedToday ? 1 : 0);
  const usesThisMonth = view.usesThisMonth + usesDelta;
  const costPerUseYen = computeCostPerUseYen(monthlyPriceYen, usesThisMonth);

  const usesLabel = view.isAccumulating ? PLACEHOLDER : formatUseCount(usesThisMonth);
  const costPerUseLabel = view.isAccumulating
    ? PLACEHOLDER
    : costPerUseYen != null
      ? formatCostPerUseYen(costPerUseYen)
      : '未利用';

  const goPrev = () => {
    slideDirection.current = -1;
    const prev = new Date(anchorYear, anchorMonth - 2, 1);
    setAnchorYear(prev.getFullYear());
    setAnchorMonth(prev.getMonth() + 1);
  };

  const goNext = () => {
    if (view.isAnchorCurrentMonth) {
      return;
    }
    slideDirection.current = 1;
    const next = new Date(anchorYear, anchorMonth, 1);
    setAnchorYear(next.getFullYear());
    setAnchorMonth(next.getMonth() + 1);
  };

  const handleRecord = () => {
    setUsedToday(true);
    onRecordUsagePress?.();
  };

  const handleUndo = () => {
    setUsedToday(false);
    onUndoUsagePress?.();
  };

  const onWeeksLayout = (event: LayoutChangeEvent) => {
    setGridWidth(event.nativeEvent.layout.width);
  };

  const cellStyle = { width: cellSize, height: cellSize, borderRadius: CELL_RADIUS };
  const weekColumnStyle = { gap: CELL_GAP };

  return (
    <View className={`w-full${className ? ` ${className}` : ''}`}>
      <Text className="mb-2 px-1 text-[13px] font-semibold text-subtle">{title}</Text>
      <View className="gap-4 rounded-2xl bg-card px-5 pb-5 pt-4">
        <View className="flex-row items-center justify-between">
          <Pressable onPress={goPrev} hitSlop={8} accessibilityRole="button" accessibilityLabel="前の期間">
            <MaterialIcons name="chevron-left" size={26} color={AppColors.text} />
          </Pressable>
          <Text className="text-[15px] font-bold text-foreground">{view.rangeLabel}</Text>
          <Pressable
            onPress={goNext}
            disabled={view.isAnchorCurrentMonth}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="次の期間">
            <MaterialIcons
              name="chevron-right"
              size={26}
              color={view.isAnchorCurrentMonth ? AppColors.navDisabled : AppColors.text}
            />
          </Pressable>
        </View>

        <Animated.View className="flex-row gap-1.5" style={heatmapAnimatedStyle}>
          <View className="justify-end gap-1">
            {WEEKDAY_LABELS.map((label, index) => (
              <View key={index} className="justify-center" style={{ height: cellSize }}>
                <Text className="text-[9px] text-subtle" style={{ lineHeight: cellSize }}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
          <View className="flex-1">
            <View className="relative" style={{ height: 14 }}>
              {view.monthLabels.map((monthLabel) => (
                <Text
                  key={`${monthLabel.weekIndex}-${monthLabel.label}`}
                  className="absolute text-[10px] font-semibold text-subtle"
                  style={{ left: monthLabel.weekIndex * (cellSize + CELL_GAP) }}>
                  {monthLabel.label}
                </Text>
              ))}
            </View>
            <View className="flex-row justify-between" onLayout={onWeeksLayout}>
              {view.weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={weekColumnStyle}>
                  {week.map((cell, dayIndex) => {
                    if (!cell.inRange) {
                      return (
                        <View key={dayIndex} className="bg-transparent" style={cellStyle} />
                      );
                    }
                    const isUsed = cell.isToday ? usedToday : cell.used;
                    const cellClass = cell.isFuture
                      ? 'bg-white/[0.03]'
                      : isUsed
                        ? 'bg-accent-brand'
                        : 'bg-surface';
                    return (
                      <View
                        key={dayIndex}
                        className={`${cellClass}${cell.isToday ? ' border-[1.5px] border-foreground' : ''}`}
                        style={cellStyle}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <View className="flex-row justify-between gap-4">
          <View className="flex-1 gap-1.5">
            <Text className="text-xs font-medium text-subtle">今月の利用回数</Text>
            <Text className="text-lg font-bold text-foreground">{usesLabel}</Text>
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-xs font-medium text-subtle">1回あたりのコスト</Text>
            <Text className="text-lg font-bold text-foreground">{costPerUseLabel}</Text>
          </View>
        </View>
      </View>

      {usedToday ? (
        <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-[rgba(220,5,45,0.5)] px-5 py-4">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="check-circle" size={20} color={AppColors.accentBrand} />
            <Text className="text-base font-bold text-foreground">今日は利用済み</Text>
          </View>
          <Pressable
            onPress={handleUndo}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="今日の利用記録を取り消す">
            <Text className="text-sm font-semibold text-subtle underline">取り消す</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-accent-brand px-6 py-[18px] active:opacity-[0.88]"
          onPress={handleRecord}
          accessibilityRole="button"
          accessibilityLabel="今日使った？">
          <MaterialIcons name="auto-awesome" size={22} color={AppColors.text} />
          <Text className="text-[17px] font-bold text-foreground">今日使った？</Text>
        </Pressable>
      )}
    </View>
  );
};
