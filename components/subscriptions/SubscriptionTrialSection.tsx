import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import {
  TrialPeriodFields,
  type TrialPeriodValue,
} from '@/components/subscriptions/TrialPeriodFields';
import { updateSubscriptionTrial } from '@/src/application/updateSubscriptionTrial';
import type { Subscription } from '@/src/domain/subscription';
import { formatTrialEndsOnLabel, isInTrial } from '@/src/domain/trialPeriod';
import { subscriptionRepositorySupabase } from '@/src/infrastructure/supabase/subscriptionRepositorySupabase';

interface SubscriptionTrialSectionProps {
  subscription: Subscription;
  onUpdated: (subscription: Subscription) => void;
}

export const SubscriptionTrialSection: React.FC<SubscriptionTrialSectionProps> = ({
  subscription,
  onUpdated,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const initialValue = useMemo<TrialPeriodValue>(
    () => ({
      enabled: subscription.trialEndsOn != null && isInTrial(subscription),
      trialEndsOn: subscription.trialEndsOn ?? null,
    }),
    [subscription]
  );
  const [value, setValue] = useState<TrialPeriodValue>(initialValue);

  const hasChanges =
    value.enabled !== initialValue.enabled ||
    (value.trialEndsOn?.getTime() ?? 0) !== (initialValue.trialEndsOn?.getTime() ?? 0);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const updated = await updateSubscriptionTrial(
        subscriptionRepositorySupabase,
        subscription,
        value.enabled ? value.trialEndsOn : null
      );
      onUpdated(updated);
      setValue({
        enabled: updated.trialEndsOn != null && isInTrial(updated),
        trialEndsOn: updated.trialEndsOn ?? null,
      });
    } catch {
      setErrorMessage('お試し期間の更新に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="gap-3">
      <Text className="px-1 text-[13px] font-semibold text-subtle">お試し期間</Text>
      <View className="rounded-2xl bg-card px-4 py-4">
        <TrialPeriodFields
          startDate={subscription.startDate}
          value={value}
          onChange={setValue}
          disabled={isSaving || subscription.status !== 'active'}
        />

        {subscription.trialEndsOn && isInTrial(subscription) ? (
          <Text className="mt-3 text-xs text-subtle">
            現在お試し中（終了予定: {formatTrialEndsOnLabel(subscription.trialEndsOn)}）
          </Text>
        ) : null}

        {errorMessage ? <Text className="mt-2 text-sm text-accent">{errorMessage}</Text> : null}

        {hasChanges ? (
          <Pressable
            onPress={() => void handleSave()}
            disabled={isSaving || (value.enabled && value.trialEndsOn == null)}
            className="mt-4 items-center rounded-full bg-accent-brand py-3 active:opacity-80"
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-sm font-bold text-foreground">お試し期間を保存</Text>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};
