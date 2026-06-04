import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

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
  style?: ViewStyle;
}

const ACCENT_COLOR = '#ff3a5e';
const TEXT_COLOR = '#ffffff';
const SECTION_TITLE_COLOR = '#9aa0a6';
const CARD_BG = '#1c1c1e';
const CELL_EMPTY = '#2c2c2e';
const CELL_FUTURE = 'rgba(255, 255, 255, 0.03)';
const STAT_LABEL_COLOR = '#9aa0a6';
const NAV_DISABLED_COLOR = 'rgba(255, 255, 255, 0.2)';
const PLACEHOLDER = '—';

const CELL_GAP = 4;
const CELL_RADIUS = 3;
const MIN_CELL_SIZE = 10;
const MAX_CELL_SIZE = 20;
// 日曜始まりの行に対応するラベル（月・水・金のみ表示）
const WEEKDAY_LABELS = ['', '月', '', '水', '', '金', ''];

export const UsageFrequencyTracker: React.FC<UsageFrequencyTrackerProps> = ({
  usedDateKeys,
  monthlyPriceYen,
  today: todayProp,
  monthsToShow = DEFAULT_MONTHS_TO_SHOW,
  onRecordUsagePress,
  onUndoUsagePress,
  title = '利用状況トラッカー',
  style,
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

  const cellStyle = { width: cellSize, height: cellSize };
  const weekColumnStyle = { gap: CELL_GAP };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        <View style={styles.header}>
          <Pressable onPress={goPrev} hitSlop={8} accessibilityRole="button" accessibilityLabel="前の期間">
            <MaterialIcons name="chevron-left" size={26} color={TEXT_COLOR} />
          </Pressable>
          <Text style={styles.rangeLabel}>{view.rangeLabel}</Text>
          <Pressable
            onPress={goNext}
            disabled={view.isAnchorCurrentMonth}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="次の期間">
            <MaterialIcons
              name="chevron-right"
              size={26}
              color={view.isAnchorCurrentMonth ? NAV_DISABLED_COLOR : TEXT_COLOR}
            />
          </Pressable>
        </View>

        <Animated.View style={[styles.heatmapRow, heatmapAnimatedStyle]}>
          <View style={styles.weekdayLabels}>
            {WEEKDAY_LABELS.map((label, index) => (
              <View key={index} style={[styles.weekdayLabelCell, { height: cellSize }]}>
                <Text style={[styles.weekdayLabelText, { lineHeight: cellSize }]}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={styles.weeksArea}>
            <View style={[styles.monthLabelRow, { height: 14 }]}>
              {view.monthLabels.map((monthLabel) => (
                <Text
                  key={`${monthLabel.weekIndex}-${monthLabel.label}`}
                  style={[
                    styles.monthLabelText,
                    { left: monthLabel.weekIndex * (cellSize + CELL_GAP) },
                  ]}>
                  {monthLabel.label}
                </Text>
              ))}
            </View>
            <View style={styles.weeks} onLayout={onWeeksLayout}>
              {view.weeks.map((week, weekIndex) => (
                <View key={weekIndex} style={weekColumnStyle}>
                  {week.map((cell, dayIndex) => {
                    if (!cell.inRange) {
                      return <View key={dayIndex} style={[styles.cell, cellStyle, styles.cellOutside]} />;
                    }
                    const isUsed = cell.isToday ? usedToday : cell.used;
                    return (
                      <View
                        key={dayIndex}
                        style={[
                          styles.cell,
                          cellStyle,
                          cell.isFuture
                            ? styles.cellFuture
                            : isUsed
                              ? styles.cellUsed
                              : styles.cellEmpty,
                          cell.isToday && styles.cellToday,
                        ]}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>今月の利用回数</Text>
            <Text style={styles.statValue}>{usesLabel}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>1回あたりのコスト</Text>
            <Text style={styles.statValue}>{costPerUseLabel}</Text>
          </View>
        </View>
      </View>

      {usedToday ? (
        <View style={styles.recordedRow}>
          <View style={styles.recordedStatus}>
            <MaterialIcons name="check-circle" size={20} color={ACCENT_COLOR} />
            <Text style={styles.recordedText}>今日は利用済み</Text>
          </View>
          <Pressable
            onPress={handleUndo}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="今日の利用記録を取り消す">
            <Text style={styles.undoText}>取り消す</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
          onPress={handleRecord}
          accessibilityRole="button"
          accessibilityLabel="今日使った？">
          <MaterialIcons name="auto-awesome" size={22} color={TEXT_COLOR} />
          <Text style={styles.ctaLabel}>今日使った？</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionTitle: {
    color: SECTION_TITLE_COLOR,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rangeLabel: {
    color: TEXT_COLOR,
    fontSize: 15,
    fontWeight: '700',
  },
  heatmapRow: {
    flexDirection: 'row',
    gap: 6,
  },
  weekdayLabels: {
    gap: CELL_GAP,
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  weekdayLabelCell: {
    justifyContent: 'center',
  },
  weekdayLabelText: {
    color: STAT_LABEL_COLOR,
    fontSize: 9,
  },
  weeksArea: {
    flex: 1,
  },
  monthLabelRow: {
    position: 'relative',
  },
  monthLabelText: {
    position: 'absolute',
    color: STAT_LABEL_COLOR,
    fontSize: 10,
    fontWeight: '600',
  },
  weeks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    borderRadius: CELL_RADIUS,
  },
  cellOutside: {
    backgroundColor: 'transparent',
  },
  cellEmpty: {
    backgroundColor: CELL_EMPTY,
  },
  cellUsed: {
    backgroundColor: ACCENT_COLOR,
  },
  cellFuture: {
    backgroundColor: CELL_FUTURE,
  },
  cellToday: {
    borderWidth: 1.5,
    borderColor: TEXT_COLOR,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  statBlock: {
    flex: 1,
    gap: 6,
  },
  statLabel: {
    color: STAT_LABEL_COLOR,
    fontSize: 12,
    fontWeight: '500',
  },
  statValue: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontWeight: '700',
  },
  ctaButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: ACCENT_COLOR,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaButtonPressed: {
    opacity: 0.88,
  },
  ctaLabel: {
    color: TEXT_COLOR,
    fontSize: 17,
    fontWeight: '700',
  },
  recordedRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 58, 94, 0.5)',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  recordedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordedText: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '700',
  },
  undoText: {
    color: STAT_LABEL_COLOR,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
