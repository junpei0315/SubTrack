import React from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import {
  formatBillingDate,
  getBillingCycleLabel,
  type BillingCycle,
} from '@/src/domain/billingCycle';

interface BillingInfoProps {
  cycle: BillingCycle;
  nextBillingDate: Date;
  startDate: Date;
  title?: string;
  style?: ViewStyle;
}

export const BillingInfo: React.FC<BillingInfoProps> = ({
  cycle,
  nextBillingDate,
  startDate,
  title = '請求情報',
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>
        <Row label="請求サイクル" value={getBillingCycleLabel(cycle)} valueAccent />
        <Divider />
        <Row label="次回請求日" value={formatBillingDate(nextBillingDate)} />
        <Divider />
        <Row label="開始日" value={formatBillingDate(startDate)} />
      </View>
    </View>
  );
};

interface RowProps {
  label: string;
  value: string;
  valueAccent?: boolean;
}

const Row: React.FC<RowProps> = ({ label, value, valueAccent = false }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueAccent && styles.valueAccent]}>{value}</Text>
    </View>
  );
};

const Divider: React.FC = () => <View style={styles.divider} />;

const ACCENT_COLOR = '#DC052D';
const TEXT_COLOR = '#ffffff';
const SECTION_TITLE_COLOR = '#9aa0a6';
const CARD_BG = '#1c1c1e';
const DIVIDER_COLOR = 'rgba(255, 255, 255, 0.08)';

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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  label: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    color: TEXT_COLOR,
    fontSize: 16,
    fontWeight: '600',
  },
  valueAccent: {
    color: ACCENT_COLOR,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER_COLOR,
  },
});
