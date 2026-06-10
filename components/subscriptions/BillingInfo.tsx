import React from 'react';
import { Text, View } from 'react-native';

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
  className?: string;
}

export const BillingInfo: React.FC<BillingInfoProps> = ({
  cycle,
  nextBillingDate,
  startDate,
  title = '請求情報',
  className,
}) => {
  return (
    <View className={`w-full${className ? ` ${className}` : ''}`}>
      <Text className="mb-2 px-1 text-[13px] font-semibold text-subtle">{title}</Text>
      <View className="rounded-2xl bg-card px-5">
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
    <View className="flex-row items-center justify-between py-5">
      <Text className="text-base font-semibold text-foreground">{label}</Text>
      <Text className={`text-base font-semibold ${valueAccent ? 'text-accent-brand' : 'text-foreground'}`}>
        {value}
      </Text>
    </View>
  );
};

const Divider: React.FC = () => <View className="h-px bg-white/[0.08]" />;
