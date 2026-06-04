import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { BillingInfo } from '@/components/subscriptions/BillingInfo';
import { UsageFrequencyTracker } from '@/components/subscriptions/UsageFrequencyTracker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getSubscriptionById } from '@/src/application/getSubscriptionById';
import type { Subscription } from '@/src/domain/subscription';
import { createMockUsageFrequencySnapshot } from '@/src/domain/usageFrequency';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

// TODO: src/features/subscriptions/screens/SubscriptionDetailScreen.tsx を実装して差し替える
// 関連機能: F-04（削除導線） / F-09（使用頻度・1回あたりコスト）
export default function SubscriptionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      } catch {
        if (isMounted) {
          setErrorMessage('請求情報の取得に失敗しました');
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
      <ThemedView style={styles.centered}>
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (errorMessage) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Subscription Detail</ThemedText>
        <ThemedText>{errorMessage}</ThemedText>
      </ThemedView>
    );
  }

  if (!subscription) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText type="title">Subscription Detail</ThemedText>
        <ThemedText>ID「{id ?? '-'}」のサブスクが見つかりません</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title">{subscription.service.name}</ThemedText>
          <ThemedText>{subscription.plan.name}</ThemedText>
        </View>
        <BillingInfo
          cycle={subscription.plan.cycle}
          nextBillingDate={subscription.nextBillingDate}
          startDate={subscription.startDate}
        />
        <UsageFrequencyTracker
          snapshot={createMockUsageFrequencySnapshot(subscription.plan.price)}
          onRecordUsagePress={() => {
            // TODO: F-08 recordUsageToday 連携
          }}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  header: {
    gap: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
});
