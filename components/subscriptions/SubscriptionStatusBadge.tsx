import React from 'react';
import { Text, View } from 'react-native';

import { formatBillingDate } from '@/src/domain/billingCycle';
import type { Subscription, SubscriptionStatus } from '@/src/domain/subscription';

interface SubscriptionStatusBadgeProps {
  status: SubscriptionStatus;
  cancelledAt?: Subscription['cancelledAt'];
}

const LABELS: Record<Exclude<SubscriptionStatus, 'active'>, string> = {
  paused: '停止中',
  cancelled: '解約済み',
};

/**
 * 稼働中(active)は何も表示しない。停止中・解約済みのみバッジを出す。
 */
export const SubscriptionStatusBadge: React.FC<SubscriptionStatusBadgeProps> = ({
  status,
  cancelledAt,
}) => {
  if (status === 'active') {
    return null;
  }

  const suffix =
    status === 'cancelled' && cancelledAt ? `（${formatBillingDate(cancelledAt)}）` : '';

  return (
    <View className="self-start rounded-full bg-surface px-3 py-1">
      <Text className="text-xs font-semibold text-subtle">
        {LABELS[status]}
        {suffix}
      </Text>
    </View>
  );
};
