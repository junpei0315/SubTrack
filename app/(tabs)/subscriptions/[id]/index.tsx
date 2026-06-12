import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';

import { BillingInfo } from '@/components/subscriptions/BillingInfo';
import { UsageFrequencyTracker } from '@/components/subscriptions/UsageFrequencyTracker';
import { useSubscriptionUsage } from '@/components/subscriptions/useSubscriptionUsage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSubscriptionById } from '@/src/application/getSubscriptionById';
import type { Subscription } from '@/src/domain/subscription';
import { getEffectiveSubscriptionPrice } from '@/src/domain/subscriptionPrice';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

// TODO: src/features/subscriptions/screens/SubscriptionDetailScreen.tsx を実装して差し替える
// 関連機能: F-04（削除導線） / F-09（使用頻度・1回あたりコスト）
export default function SubscriptionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { usedDateKeys, recordToday, undoToday } = useSubscriptionUsage({
    subscriptionId: id ?? '',
    userId: subscription?.userId ?? '',
  });

  useEffect(() => {
    let isMounted = true;

    async function loadSubscription() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const result = await getSubscriptionById(subscriptionRepositorySupabase, id ?? '');
        if (isMounted) {
          setSubscription(result);
        }
      } catch (error) {
        if (isMounted) {
          const detail =
            __DEV__ && error instanceof Error ? `\n（${error.message}）` : '';
          setErrorMessage(`請求情報の取得に失敗しました${detail}`);
        }
        if (__DEV__) {
          console.error('[SubscriptionDetail] load failed', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSubscription();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center gap-2 p-4">
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (errorMessage) {
    return (
      <ThemedView className="flex-1 items-center justify-center gap-2 p-4">
        <ThemedText type="title">Subscription Detail</ThemedText>
        <ThemedText>{errorMessage}</ThemedText>
      </ThemedView>
    );
  }

  if (!subscription) {
    return (
      <ThemedView className="flex-1 items-center justify-center gap-2 p-4">
        <ThemedText type="title">Subscription Detail</ThemedText>
        <ThemedText>ID「{id ?? '-'}」のサブスクが見つかりません</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <ScrollView contentContainerClassName="gap-6 p-4">
        <View className="gap-1">
          <ThemedText type="title">{subscription.service.name}</ThemedText>
          <ThemedText>{subscription.plan.name}</ThemedText>
        </View>
        <BillingInfo
          cycle={subscription.plan.cycle}
          nextBillingDate={subscription.nextBillingDate}
          startDate={subscription.startDate}
        />
        <UsageFrequencyTracker
          usedDateKeys={usedDateKeys}
          monthlyPriceYen={getEffectiveSubscriptionPrice(subscription)}
          onRecordUsagePress={() => {
            void recordToday();
          }}
          onUndoUsagePress={() => {
            void undoToday();
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}
