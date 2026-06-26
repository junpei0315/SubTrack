import { useRouter } from 'expo-router';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { ServiceLogoBadge } from '@/components/analytics/ServiceLogoBadge';
import { ContractPriceText } from '@/components/currency/ContractPriceText';
import { getBillingCycleLabel } from '@/src/domain/billingCycle';
import type { Subscription } from '@/src/domain/subscription';
import { getEffectiveSubscriptionPrice } from '@/src/domain/subscriptionPrice';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'] as const;

function formatDayHeading(date: Date): string {
  return `${date.getMonth() + 1}月${date.getDate()}日（${WEEKDAYS[date.getDay()]}）の支払い`;
}

interface CalendarDayModalProps {
  date: Date | null;
  subscriptions: Subscription[];
  onClose: () => void;
}

export function CalendarDayModal({ date, subscriptions, onClose }: CalendarDayModalProps) {
  const router = useRouter();

  const handleSelect = (subscription: Subscription) => {
    onClose();
    router.push(`/(tabs)/subscriptions/${subscription.id}`);
  };

  return (
    <Modal visible={date != null} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        className="flex-1 items-center justify-center bg-black/60 px-5"
        onPress={onClose}
      >
        <Pressable
          className="max-h-[70%] w-full max-w-md rounded-2xl bg-card px-5 pb-5 pt-5"
          onPress={(event) => event.stopPropagation()}
        >
          <Text className="mb-1 text-lg font-bold text-foreground">
            {date ? formatDayHeading(date) : ''}
          </Text>
          <Text className="mb-4 text-sm text-subtle">{subscriptions.length}件</Text>

          <ScrollView className="max-h-80">
            {subscriptions.map((subscription) => (
              <Pressable
                key={subscription.id}
                onPress={() => handleSelect(subscription)}
                className="flex-row items-center gap-3 border-b border-white/5 py-3 active:opacity-80"
                accessibilityRole="button"
                accessibilityLabel={`${subscription.service.name}の詳細を開く`}
              >
                <ServiceLogoBadge
                  name={subscription.service.name}
                  logoKey={subscription.service.logoKey}
                  logoUri={subscription.service.logoUri}
                  size="sm"
                />
                <View className="min-w-0 flex-1 gap-0.5">
                  <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                    {subscription.service.name}
                  </Text>
                  <Text className="text-xs text-subtle" numberOfLines={1}>
                    {subscription.plan.name}
                  </Text>
                </View>
                <View className="items-end gap-0.5">
                  <ContractPriceText
                    amount={getEffectiveSubscriptionPrice(subscription)}
                    currency={subscription.plan.currency}
                    className="text-sm font-bold text-foreground"
                  />
                  <Text className="text-[11px] font-semibold text-accent">
                    {getBillingCycleLabel(subscription.plan.cycle)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          <Pressable
            onPress={onClose}
            className="mt-4 items-center rounded-2xl bg-surface py-3 active:opacity-80"
            accessibilityRole="button"
            accessibilityLabel="閉じる"
          >
            <Text className="text-sm font-bold text-foreground">閉じる</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
