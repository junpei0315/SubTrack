import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';

import {
  formatAverageUsageHours,
  formatCostPerHourYen,
  type UsageFrequencySnapshot,
} from '@/src/domain/usageFrequency';

interface UsageFrequencyTrackerProps {
  snapshot: UsageFrequencySnapshot;
  onRecordUsagePress?: () => void;
  title?: string;
  style?: ViewStyle;
}

const BAR_MAX_HEIGHT = 88;
const ACCENT_COLOR = '#ff3a5e';
const TEXT_COLOR = '#ffffff';
const SECTION_TITLE_COLOR = '#9aa0a6';
const CARD_BG = '#1c1c1e';
const BAR_INACTIVE = '#3a3a3c';
const STAT_LABEL_COLOR = '#9aa0a6';
const PLACEHOLDER = '—';

export const UsageFrequencyTracker: React.FC<UsageFrequencyTrackerProps> = ({
  snapshot,
  onRecordUsagePress,
  title = '利用状況トラッカー',
  style,
}) => {
  const averageHoursLabel = snapshot.isAccumulating
    ? PLACEHOLDER
    : snapshot.averageHoursPerMonth != null
      ? formatAverageUsageHours(snapshot.averageHoursPerMonth)
      : PLACEHOLDER;

  const costPerHourLabel = snapshot.isAccumulating
    ? PLACEHOLDER
    : snapshot.costPerHourYen != null
      ? formatCostPerHourYen(snapshot.costPerHourYen)
      : PLACEHOLDER;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        <View style={styles.chartRow}>
          {snapshot.bars.map((bar, index) => (
            <View key={index} style={styles.barColumn}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(8, bar.normalizedHeight * BAR_MAX_HEIGHT),
                    backgroundColor: bar.isHighlighted ? ACCENT_COLOR : BAR_INACTIVE,
                  },
                  bar.isHighlighted && styles.barHighlighted,
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>平均利用時間</Text>
            <Text style={styles.statValue}>{averageHoursLabel}</Text>
          </View>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>1時間あたりのコスト</Text>
            <Text style={styles.statValue}>{costPerHourLabel}</Text>
          </View>
        </View>
      </View>
      <Pressable
        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}
        onPress={onRecordUsagePress}
        accessibilityRole="button"
        accessibilityLabel="今日使った？">
        <MaterialIcons name="auto-awesome" size={22} color={TEXT_COLOR} />
        <Text style={styles.ctaLabel}>今日使った？</Text>
      </Pressable>
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
    paddingTop: 24,
    paddingBottom: 20,
    gap: 24,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT,
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: BAR_MAX_HEIGHT,
  },
  bar: {
    width: '100%',
    maxWidth: 36,
    borderRadius: 6,
    minHeight: 8,
  },
  barHighlighted: {
    shadowColor: ACCENT_COLOR,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 10,
    elevation: 8,
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
});
