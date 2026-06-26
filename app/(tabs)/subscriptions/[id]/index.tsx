import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ContractPriceText } from '@/components/currency/ContractPriceText';
import { useExchangeRates } from '@/components/currency/ExchangeRateProvider';
import { BillingInfo } from '@/components/subscriptions/BillingInfo';
import { resolveServiceLogo } from '@/components/subscriptions/serviceLogos';
import { SubscriptionStatusBadge } from '@/components/subscriptions/SubscriptionStatusBadge';
import { SubscriptionTrialSection } from '@/components/subscriptions/SubscriptionTrialSection';
import { UsageFrequencyTracker } from '@/components/subscriptions/UsageFrequencyTracker';
import { useSubscriptionActions } from '@/components/subscriptions/useSubscriptionActions';
import { useSubscriptionUsage } from '@/components/subscriptions/useSubscriptionUsage';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/colors';
import { getSubscriptionById } from '@/src/application/getSubscriptionById';
import { getBillingCycleLabel } from '@/src/domain/billingCycle';
import { getMonthlyNormalizedPrice } from '@/src/domain/normalizeBilling';
import type { Subscription } from '@/src/domain/subscription';
import { getEffectiveSubscriptionPrice } from '@/src/domain/subscriptionPrice';
import { isInTrial } from '@/src/domain/trialPeriod';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

// TODO: src/features/subscriptions/screens/SubscriptionDetailScreen.tsx を実装して差し替える
// 関連機能: F-04（削除導線） / F-09（使用頻度・1回あたりコスト）
export default function SubscriptionDetailRoute() {
  const router = useRouter();
  const { convertInJpy } = useExchangeRates();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { usedDateKeys, recordToday, undoToday, toggleUsageDate } = useSubscriptionUsage({
    subscriptionId: id ?? '',
    userId: subscription?.userId ?? '',
  });

  const { isBusy, pause, resume, confirmCancel, confirmDelete } = useSubscriptionActions({
    onUpdated: setSubscription,
    onDeleted: () => router.back(),
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
      <View className="flex-1 items-center justify-center bg-background p-4" style={styles.screen}>
        <ActivityIndicator />
      </View>
    );
  }

  if (errorMessage) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-background p-4" style={styles.screen}>
        <ThemedText type="title">Subscription Detail</ThemedText>
        <ThemedText>{errorMessage}</ThemedText>
      </View>
    );
  }

  if (!subscription) {
    return (
      <View className="flex-1 items-center justify-center gap-2 bg-background p-4" style={styles.screen}>
        <ThemedText type="title">Subscription Detail</ThemedText>
        <ThemedText>ID「{id ?? '-'}」のサブスクが見つかりません</ThemedText>
      </View>
    );
  }

  const { service, plan } = subscription;
  const logoSource = resolveServiceLogo(service.logoKey, service.logoUri);
  const initial = service.name.charAt(0).toUpperCase();
  const price = getEffectiveSubscriptionPrice(subscription);
  const monthlyPriceYen =
    convertInJpy(getMonthlyNormalizedPrice(subscription), plan.currency) ??
    getMonthlyNormalizedPrice(subscription);

  return (
    <ScrollView
      className="flex-1 bg-background"
      style={styles.screen}
      contentContainerClassName="grow"
    >
      <View className="gap-6 px-5 pb-8 pt-1">
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
            <View className="mt-1 flex-row items-start gap-2">
              <ContractPriceText
                amount={price}
                currency={plan.currency}
                align="start"
                className="text-lg font-bold text-foreground"
              />
              <Text className="pt-0.5 text-sm font-semibold text-accent">
                {getBillingCycleLabel(plan.cycle)}
              </Text>
            </View>
            <SubscriptionStatusBadge
              status={subscription.status}
              cancelledAt={subscription.cancelledAt}
            />
          </View>
        </View>

        <BillingInfo
          cycle={plan.cycle}
          nextBillingDate={subscription.nextBillingDate}
          startDate={subscription.startDate}
          trialEndsOn={
            subscription.trialEndsOn && isInTrial(subscription)
              ? subscription.trialEndsOn
              : undefined
          }
        />
        <SubscriptionTrialSection subscription={subscription} onUpdated={setSubscription} />
        <UsageFrequencyTracker
          usedDateKeys={usedDateKeys}
          monthlyPriceYen={monthlyPriceYen}
          onRecordUsagePress={() => {
            void recordToday();
          }}
          onUndoUsagePress={() => {
            void undoToday();
          }}
          onToggleDate={(dateKey, nextUsed) => {
            void toggleUsageDate(dateKey, nextUsed);
          }}
        />

        <View className="mt-2 gap-3">
          <ActionButton
            icon="edit"
            label="契約内容を編集"
            disabled={isBusy}
            onPress={() => router.push(`/(tabs)/subscriptions/${subscription.id}/edit`)}
          />

          {subscription.status === 'active' ? (
            <ActionButton
              icon="pause-circle-outline"
              label="一時停止する"
              disabled={isBusy}
              onPress={() => void pause(subscription)}
            />
          ) : (
            <ActionButton
              icon="play-circle-outline"
              label={subscription.status === 'cancelled' ? '再開する（契約を戻す）' : '再開する'}
              disabled={isBusy}
              onPress={() => void resume(subscription)}
            />
          )}

          {subscription.status !== 'cancelled' ? (
            <ActionButton
              icon="cancel"
              label="解約する"
              variant="warning"
              disabled={isBusy}
              onPress={() => confirmCancel(subscription)}
            />
          ) : null}

          <ActionButton
            icon="delete-outline"
            label="削除する"
            variant="danger"
            disabled={isBusy}
            onPress={() => confirmDelete(subscription)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

type ActionButtonVariant = 'default' | 'warning' | 'danger';

interface ActionButtonProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: ActionButtonVariant;
}

const VARIANT_TEXT: Record<ActionButtonVariant, string> = {
  default: 'text-foreground',
  warning: 'text-accent',
  danger: 'text-accent-brand',
};

function ActionButton({
  icon,
  label,
  onPress,
  disabled = false,
  variant = 'default',
}: ActionButtonProps) {
  const color =
    variant === 'danger'
      ? AppColors.accentBrand
      : variant === 'warning'
        ? AppColors.accent
        : AppColors.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`flex-row items-center justify-center gap-2 rounded-2xl bg-card px-4 py-4 active:opacity-80${
        disabled ? ' opacity-50' : ''
      }`}
    >
      <MaterialIcons name={icon} size={20} color={color} />
      <Text className={`text-base font-bold ${VARIANT_TEXT[variant]}`}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    width: '100%',
    alignSelf: 'stretch',
  },
});
