import { MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { formatLocalDate } from '@/src/domain/localDate';
import {
  buildMonthUsageView,
  computeCostPerUseYen,
  formatCostPerUseYen,
  formatUseCount,
} from '@/src/domain/usageFrequency';

interface UsageFrequencyTrackerProps {
  usedDateKeys: ReadonlySet<string>;
  monthlyPriceYen: number;
  today?: Date;
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

const CELL_SIZE = 30;
const CELL_GAP = 4;
const CELL_RADIUS = 6;
const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export const UsageFrequencyTracker: React.FC<UsageFrequencyTrackerProps> = ({
  usedDateKeys,
  monthlyPriceYen,
  today: todayProp,
  onRecordUsagePress,
  onUndoUsagePress,
  title = '利用状況トラッカー',
  style,
}) => {
  const today = useMemo(() => todayProp ?? new Date(), [todayProp]);
  const todayKey = formatLocalDate(today);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [usedToday, setUsedToday] = useState(usedDateKeys.has(todayKey));

  useEffect(() => {
    setUsedToday(usedDateKeys.has(todayKey));
  }, [usedDateKeys, todayKey]);

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1;

  const view = useMemo(
    () => buildMonthUsageView(usedDateKeys, monthlyPriceYen, viewYear, viewMonth, today),
    [usedDateKeys, monthlyPriceYen, viewYear, viewMonth, today]
  );

  const usesDelta = isCurrentMonth ? (usedToday ? 1 : 0) - (view.isUsedToday ? 1 : 0) : 0;
  const usesInMonth = view.usesInMonth + usesDelta;
  const costPerUseYen = computeCostPerUseYen(monthlyPriceYen, usesInMonth);

  const usesLabel = view.isAccumulating ? PLACEHOLDER : formatUseCount(usesInMonth);
  const costPerUseLabel = view.isAccumulating
    ? PLACEHOLDER
    : costPerUseYen != null
      ? formatCostPerUseYen(costPerUseYen)
      : '未利用';

  const goPrevMonth = () => {
    const prev = new Date(viewYear, viewMonth - 2, 1);
    setViewYear(prev.getFullYear());
    setViewMonth(prev.getMonth() + 1);
  };

  const goNextMonth = () => {
    if (isCurrentMonth) {
      return;
    }
    const next = new Date(viewYear, viewMonth, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth() + 1);
  };

  const handleRecord = () => {
    setUsedToday(true);
    onRecordUsagePress?.();
  };

  const handleUndo = () => {
    setUsedToday(false);
    onUndoUsagePress?.();
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        <View style={styles.header}>
          <Pressable
            onPress={goPrevMonth}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="前の月">
            <MaterialIcons name="chevron-left" size={26} color={TEXT_COLOR} />
          </Pressable>
          <Text style={styles.monthLabel}>{view.monthLabel}</Text>
          <Pressable
            onPress={goNextMonth}
            disabled={isCurrentMonth}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="次の月">
            <MaterialIcons
              name="chevron-right"
              size={26}
              color={isCurrentMonth ? NAV_DISABLED_COLOR : TEXT_COLOR}
            />
          </Pressable>
        </View>

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.grid}>
          {view.weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {week.map((cell, dayIndex) => {
                if (!cell.inMonth) {
                  return <View key={dayIndex} style={[styles.cell, styles.cellOutside]} />;
                }
                const isUsed = cell.isToday ? usedToday : cell.used;
                return (
                  <View
                    key={dayIndex}
                    style={[
                      styles.cell,
                      cell.isFuture
                        ? styles.cellFuture
                        : isUsed
                          ? styles.cellUsed
                          : styles.cellEmpty,
                      cell.isToday && styles.cellToday,
                    ]}>
                    <Text
                      style={[
                        styles.cellText,
                        cell.isFuture && styles.cellTextFuture,
                        isUsed && styles.cellTextUsed,
                      ]}>
                      {cell.date.getDate()}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>{isCurrentMonth ? '今月' : 'この月'}の利用回数</Text>
            <Text style={styles.statValue}>{usesLabel}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>1回あたりのコスト</Text>
            <Text style={styles.statValue}>{costPerUseLabel}</Text>
          </View>
        </View>
      </View>

      {isCurrentMonth ? (
        usedToday ? (
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
        )
      ) : null}
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
  monthLabel: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayCell: {
    width: CELL_SIZE,
    alignItems: 'center',
  },
  weekdayText: {
    color: STAT_LABEL_COLOR,
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    gap: CELL_GAP,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: CELL_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
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
  cellText: {
    color: STAT_LABEL_COLOR,
    fontSize: 11,
    fontWeight: '600',
  },
  cellTextUsed: {
    color: TEXT_COLOR,
  },
  cellTextFuture: {
    color: NAV_DISABLED_COLOR,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 4,
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
