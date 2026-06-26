import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, useWindowDimensions, View } from 'react-native';
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
  onToggleDate?: (dateKey: string, nextUsed: boolean) => void;
  title?: string;
  className?: string;
}

const CELL_GAP = 4;
const CELL_RADIUS = 3;
const MIN_CELL_SIZE = 12;
const MAX_CELL_SIZE = 24;
const MONTH_LABEL_ROW_HEIGHT = 14;
const WEEKDAY_LABEL_WIDTH = 14;
// 月曜始まりの行に対応するラベル（月・水・金・日を表示）
const WEEKDAY_LABELS = ['月', '', '水', '', '金', '', '日'] as const;

const PLACEHOLDER = '—';

function cellMarginBottom(dayIndex: number): number {
  return dayIndex < WEEKDAY_LABELS.length - 1 ? CELL_GAP : 0;
}

function weekMarginRight(weekIndex: number, weekCount: number): number {
  return weekIndex < weekCount - 1 ? CELL_GAP : 0;
}

interface HeatmapDayCellProps {
  cellSize: number;
  dayIndex: number;
  inRange: boolean;
  isFuture: boolean;
  isUsed: boolean;
  isToday: boolean;
  dateKey: string;
  onToggleDate?: (dateKey: string, nextUsed: boolean) => void;
}

function HeatmapDayCell({
  cellSize,
  dayIndex,
  inRange,
  isFuture,
  isUsed,
  isToday,
  dateKey,
  onToggleDate,
}: HeatmapDayCellProps) {
  if (!inRange) {
    return (
      <View
        style={{
          width: cellSize,
          height: cellSize,
          marginBottom: cellMarginBottom(dayIndex),
        }}
      />
    );
  }

  const backgroundColor = isFuture
    ? 'rgba(255,255,255,0.03)'
    : isUsed
      ? AppColors.accentBrand
      : undefined;

  const canToggle = inRange && !isFuture && onToggleDate != null;

  const cellBody = (
    <>
      {isUsed || isFuture ? null : <View className="absolute inset-0 bg-surface" />}
      {isToday ? (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            borderWidth: 1.5,
            borderColor: AppColors.text,
            borderRadius: CELL_RADIUS,
          }}
        />
      ) : null}
    </>
  );

  const wrapperStyle = {
    width: cellSize,
    height: cellSize,
    marginBottom: cellMarginBottom(dayIndex),
    borderRadius: CELL_RADIUS,
    backgroundColor,
    overflow: 'hidden' as const,
  };

  if (canToggle) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isUsed ? `${dateKey} の利用記録を取り消す` : `${dateKey} を利用済みにする`}
        onPress={() => onToggleDate(dateKey, !isUsed)}
        style={wrapperStyle}
      >
        {cellBody}
      </Pressable>
    );
  }

  return (
    <View style={wrapperStyle}>
      {cellBody}
    </View>
  );
}

export const UsageFrequencyTracker: React.FC<UsageFrequencyTrackerProps> = ({
  usedDateKeys,
  monthlyPriceYen,
  today: todayProp,
  monthsToShow = DEFAULT_MONTHS_TO_SHOW,
  onRecordUsagePress,
  onUndoUsagePress,
  onToggleDate,
  title = '利用状況トラッカー',
  className,
}) => {
  const today = useMemo(() => todayProp ?? new Date(), [todayProp]);
  const todayKey = formatLocalDate(today);

  const { width: screenWidth } = useWindowDimensions();
  const estimatedGridWidth = Math.max(0, screenWidth - 88);

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
    const layoutWidth = gridWidth > 0 ? gridWidth : estimatedGridWidth;
    if (layoutWidth <= 0 || weekCount <= 0) {
      return MIN_CELL_SIZE;
    }
    const raw = (layoutWidth - CELL_GAP * (weekCount - 1)) / weekCount;
    return Math.max(MIN_CELL_SIZE, Math.min(MAX_CELL_SIZE, Math.floor(raw)));
  }, [gridWidth, estimatedGridWidth, weekCount]);

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

  const onGridLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    if (nextWidth > 0) {
      setGridWidth(nextWidth);
    }
  };

  const gridHeight =
    WEEKDAY_LABELS.length * cellSize + (WEEKDAY_LABELS.length - 1) * CELL_GAP;

  return (
    <View className={`w-full${className ? ` ${className}` : ''}`}>
      <Text className="mb-2 px-1 text-[13px] font-semibold text-subtle">{title}</Text>
      {onToggleDate ? (
        <Text className="mb-2 px-1 text-xs text-subtle">過去の日付をタップして利用記録を追加・取り消しできます</Text>
      ) : null}
      <View className="gap-4 rounded-2xl bg-card px-4 pb-4 pt-4">
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

        <Animated.View style={heatmapAnimatedStyle}>
          <View className="flex-row">
            <View style={{ width: WEEKDAY_LABEL_WIDTH, marginRight: 6 }}>
              <View style={{ height: MONTH_LABEL_ROW_HEIGHT }} />
              <View style={{ height: gridHeight }}>
                {WEEKDAY_LABELS.map((label, dayIndex) =>
                  label ? (
                    <Text
                      key={dayIndex}
                      style={{
                        position: 'absolute',
                        left: 0,
                        top:
                          dayIndex * (cellSize + CELL_GAP) +
                          (cellSize - 10) / 2,
                        fontSize: 9,
                        lineHeight: 10,
                        color: AppColors.subtle,
                      }}
                    >
                      {label}
                    </Text>
                  ) : null
                )}
              </View>
            </View>

            <View className="min-w-0 flex-1" onLayout={onGridLayout}>
              <View
                className="relative"
                style={{ height: MONTH_LABEL_ROW_HEIGHT, marginBottom: 0 }}
              >
                {view.monthLabels.map((monthLabel) => (
                  <Text
                    key={`${monthLabel.weekIndex}-${monthLabel.label}`}
                    className="absolute text-[10px] font-semibold text-subtle"
                    style={{ left: monthLabel.weekIndex * (cellSize + CELL_GAP) }}
                  >
                    {monthLabel.label}
                  </Text>
                ))}
              </View>

              <View className="flex-row" style={{ height: gridHeight }}>
                {view.weeks.map((week, weekIndex) => (
                  <View
                    key={weekIndex}
                    style={{ marginRight: weekMarginRight(weekIndex, weekCount) }}
                  >
                    {week.map((cell, dayIndex) => {
                      const dateKey = formatLocalDate(cell.date);
                      const isUsed = cell.isToday ? usedToday : cell.used;
                      return (
                        <HeatmapDayCell
                          key={dayIndex}
                          cellSize={cellSize}
                          dayIndex={dayIndex}
                          inRange={cell.inRange}
                          isFuture={cell.isFuture}
                          isUsed={isUsed}
                          isToday={cell.isToday}
                          dateKey={dateKey}
                          onToggleDate={onToggleDate}
                        />
                      );
                    })}
                  </View>
                ))}
              </View>
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
        <View className="mt-4 flex-row items-center justify-between rounded-2xl border border-[rgba(220,5,45,0.5)] px-4 py-4">
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
          className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-accent-brand px-4 py-[18px] active:opacity-[0.88]"
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
