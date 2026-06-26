import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  SubscriptionEditForm,
  type SubscriptionEditFormValues,
} from '@/components/subscriptions/SubscriptionEditForm';
import { useInvalidateSubscriptions } from '@/components/subscriptions/SubscriptionRefreshProvider';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/colors';
import { getSubscriptionById } from '@/src/application/getSubscriptionById';
import { updateSubscriptionDetails } from '@/src/application/updateSubscriptionDetails';
import type { Subscription } from '@/src/domain/subscription';
import { subscriptionPriceHistoryRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionPriceHistoryRepositorySupabase';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

// 関連機能: F-03（編集）
export default function SubscriptionEditRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const invalidateSubscriptions = useInvalidateSubscriptions();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await getSubscriptionById(subscriptionRepositorySupabase, id ?? '');
        if (isMounted) {
          setSubscription(result);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('契約情報の取得に失敗しました');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmit = async (values: SubscriptionEditFormValues) => {
    if (!subscription) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const updated = await updateSubscriptionDetails(
        subscriptionRepositorySupabase,
        subscriptionPriceHistoryRepositorySupabase,
        {
          subscription,
          price: values.price,
          startDate: values.startDate,
          nextBillingDate: values.nextBillingDate,
          priceChangeScope: values.priceChangeScope,
        }
      );
      invalidateSubscriptions();
      router.replace(`/(tabs)/subscriptions/${updated.id}`);
    } catch {
      setErrorMessage('保存に失敗しました。通信環境を確認して再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color={AppColors.text} />
      </View>
    );
  }

  if (errorMessage && !subscription) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-background px-6">
        <ThemedText>{errorMessage}</ThemedText>
        <Pressable onPress={() => router.back()} className="rounded-full bg-accent px-6 py-3">
          <Text className="font-semibold text-foreground">戻る</Text>
        </Pressable>
      </View>
    );
  }

  if (!subscription) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-6">
        <ThemedText>契約が見つかりません</ThemedText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center gap-2 px-5 pb-2 pt-3">
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button">
          <MaterialIcons name="arrow-back" size={22} color={AppColors.text} />
        </Pressable>
        <Text className="text-lg font-bold text-foreground">契約を編集</Text>
      </View>

      {errorMessage ? (
        <Text className="px-5 pb-2 text-sm text-error-alt">{errorMessage}</Text>
      ) : null}

      <SubscriptionEditForm
        subscription={subscription}
        isSubmitting={isSubmitting}
        onSubmit={(values) => {
          void handleSubmit(values);
        }}
      />
    </View>
  );
}
