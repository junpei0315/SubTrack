import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { BillingInfo } from '@/components/subscriptions/BillingInfo';
import { resolveServiceLogo } from '@/components/subscriptions/serviceLogos';
import { UsageFrequencyTracker } from '@/components/subscriptions/UsageFrequencyTracker';
import { useSubscriptionUsage } from '@/components/subscriptions/useSubscriptionUsage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppColors } from '@/constants/colors';
import { getSubscriptionById } from '@/src/application/getSubscriptionById';
import { getBillingCycleLabel } from '@/src/domain/billingCycle';
import { formatPrice } from '@/src/domain/money';
import type { Subscription } from '@/src/domain/subscription';
import { getEffectiveSubscriptionPrice } from '@/src/domain/subscriptionPrice';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

// TODO: src/features/subscriptions/screens/SubscriptionDetailScreen.tsx を実装して差し替える
// 関連機能: F-04（削除導線） / F-09（使用頻度・1回あたりコスト）
export default function SubscriptionDetailRoute() {
  const router = useRouter();
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

  const { service, plan } = subscription;
  const logoSource = resolveServiceLogo(service.logoKey, service.logoUri);
  const initial = service.name.charAt(0).toUpperCase();
  const price = getEffectiveSubscriptionPrice(subscription);

  return (
    <ThemedView className="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="w-full grow gap-6 px-4 pb-8">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-1 self-start py-1"
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="戻る"
        >
          <MaterialIcons name="arrow-back" size={22} color={AppColors.text} />
          <Text className="text-base text-foreground">戻る</Text>
        </Pressable>

        <View className="w-full flex-row items-center gap-4">
          <View className="h-16 w-16 overflow-hidden rounded-2xl">
            {logoSource ? (
              <Image source={logoSource} className="h-full w-full" contentFit="cover" />
            ) : (
              <View className="h-full w-full items-center justify-center bg-surface">
                <Text className="text-2xl font-bold text-foreground">{initial}</Text>
              </View>
            )}
          </View>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-xl font-bold text-foreground" numberOfLines={2}>
              {service.name}
            </Text>
            <Text className="text-[15px] text-subtle" numberOfLines={2}>
              {plan.name}
            </Text>
            <View className="mt-1 flex-row items-baseline gap-2">
              <Text className="text-lg font-bold text-foreground">
                {formatPrice(price, plan.currency)}
              </Text>
              <Text className="text-sm font-semibold text-accent">
                {getBillingCycleLabel(plan.cycle)}
              </Text>
            </View>
          </View>
        </View>

        <BillingInfo
          cycle={plan.cycle}
          nextBillingDate={subscription.nextBillingDate}
          startDate={subscription.startDate}
        />
        <UsageFrequencyTracker
          usedDateKeys={usedDateKeys}
          monthlyPriceYen={price}
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
