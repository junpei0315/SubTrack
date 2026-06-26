import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/components/auth/AuthProvider';
import { filterPresets } from '@/components/subscriptions/filterPresets';
import {
  ManualSubscriptionForm,
  type ManualSubscriptionFormValues,
} from '@/components/subscriptions/ManualSubscriptionForm';
import {
  PresetDetailModal,
  type PresetSelection,
} from '@/components/subscriptions/PresetDetailModal';
import { PresetGridList } from '@/components/subscriptions/PresetGridList';
import { PresetPickerFilters } from '@/components/subscriptions/PresetPickerFilters';
import { useCreateCustomSubscription } from '@/components/subscriptions/useCreateCustomSubscription';
import { useCreateSubscriptionFromPreset } from '@/components/subscriptions/useCreateSubscriptionFromPreset';
import { usePresetList } from '@/components/subscriptions/usePresetList';
import { useSubscriptionList } from '@/components/subscriptions/useSubscriptionList';
import { showAlert } from '@/components/ui/confirm';
import { SheetModalHeader } from '@/components/ui/sheet-modal-header';
import { DUPLICATE_PLAN_ERROR } from '@/src/application/createSubscriptionFromPreset';
import { type GenreId } from '@/src/domain/genre';
import type { PresetService } from '@/src/domain/preset';
import {
  getRegisteredPlanIds,
  isPlanRegistered,
  isPresetFullyRegistered,
} from '@/src/domain/registeredPlanIds';

// 関連機能: F-01（プリセット選択で一括登録）/ F-02（カスタム新規追加）
// プリセットから追加 と 手動入力 をページ遷移なしで切り替える。
type AddMode = 'preset' | 'manual';

const MODE_TABS: { id: AddMode; label: string }[] = [
  { id: 'preset', label: 'プリセットから追加' },
  { id: 'manual', label: '手動で入力' },
];

function navigateToHomeAfterAdd(router: ReturnType<typeof useRouter>): void {
  router.replace('/(tabs)/home');
}

export default function SubscriptionNewRoute() {
  const router = useRouter();
  const [mode, setMode] = useState<AddMode>('preset');
  const [isPresetDetailVisible, setIsPresetDetailVisible] = useState(false);

  const handleClose = () => {
    if (process.env.EXPO_OS === 'ios') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <View className="flex-1 bg-background-darker">
      {!isPresetDetailVisible ? (
        <SheetModalHeader onClose={handleClose} useSafeAreaTop />
      ) : null}

      <View className="flex-row gap-2 px-4">
        {MODE_TABS.map((tab) => {
          const isActive = tab.id === mode;
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.8}
              onPress={() => setMode(tab.id)}
              className={`flex-1 items-center justify-center rounded-full px-4 py-3 ${isActive ? 'bg-accent' : 'bg-white/[0.08]'}`}
            >
              <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {mode === 'preset' ? (
        <PresetAddSection onDetailVisibleChange={setIsPresetDetailVisible} />
      ) : (
        <ManualAddSection />
      )}
    </View>
  );
}

function PresetAddSection({
  onDetailVisibleChange,
}: {
  onDetailVisibleChange?: (visible: boolean) => void;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<GenreId | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetService | null>(null);
  const { presets, isLoading, errorMessage, reload } = usePresetList();
  const {
    subscriptions,
    isLoading: isLoadingSubscriptions,
    errorMessage: subscriptionsError,
    reload: reloadSubscriptions,
  } = useSubscriptionList();
  const { create, isSubmitting } = useCreateSubscriptionFromPreset();

  const isRegisteredStateReady = !isLoadingSubscriptions && subscriptionsError === null;

  const registeredPlanIds = useMemo(
    () => (isRegisteredStateReady ? getRegisteredPlanIds(subscriptions) : new Set<string>()),
    [subscriptions, isRegisteredStateReady]
  );

  useEffect(() => {
    onDetailVisibleChange?.(selectedPreset !== null);
  }, [selectedPreset, onDetailVisibleChange]);

  const handlePresetPress = (preset: PresetService) => {
    if (!isRegisteredStateReady) {
      return;
    }
    setSelectedPreset(preset);
  };

  const handleReload = () => {
    void reload();
    void reloadSubscriptions();
  };

  const handleConfirm = async (selection: PresetSelection) => {
    const userId = session?.user.id;
    if (!userId) {
      Alert.alert('ログインが必要です', '再度ログインしてからお試しください。');
      return;
    }

    if (!isRegisteredStateReady) {
      showAlert('読み込み中です', '登録状況の確認が完了するまでお待ちください。');
      return;
    }

    if (isPlanRegistered(selection.plan.id, registeredPlanIds)) {
      showAlert('登録できません', 'このプランはすでに登録されています。');
      return;
    }

    try {
      await create({
        userId,
        planId: selection.plan.id,
        planPrice: selection.plan.price,
        cycle: selection.plan.cycle,
        startDate: selection.startDate,
        price: selection.price,
        trialEndsOn: selection.trialEndsOn,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedPreset(null);
      navigateToHomeAfterAdd(router);
    } catch (error) {
      if (error instanceof Error && error.message === DUPLICATE_PLAN_ERROR) {
        showAlert('登録できません', 'このプランはすでに登録されています。');
        return;
      }
      Alert.alert('登録に失敗しました', '通信環境を確認して再度お試しください。');
    }
  };

  const filtered = useMemo(
    () => filterPresets(presets, query, genreFilter),
    [presets, query, genreFilter]
  );

  return (
    <View className="flex-1">
      <PresetPickerFilters
        query={query}
        onQueryChange={setQuery}
        genreFilter={genreFilter}
        onGenreChange={setGenreFilter}
      />

      <PresetGridList
        presets={filtered}
        isLoading={isLoading || isLoadingSubscriptions}
        errorMessage={errorMessage ?? subscriptionsError}
        onPresetPress={handlePresetPress}
        onReload={handleReload}
        isPresetDisabled={(preset) =>
          isRegisteredStateReady && isPresetFullyRegistered(preset, registeredPlanIds)
        }
        refreshable
      />

      <PresetDetailModal
        preset={selectedPreset}
        visible={selectedPreset !== null}
        isSubmitting={isSubmitting}
        registeredPlanIdsReady={isRegisteredStateReady}
        registeredPlanIds={isRegisteredStateReady ? registeredPlanIds : undefined}
        onClose={() => setSelectedPreset(null)}
        onDismissAll={() => router.back()}
        onConfirm={handleConfirm}
      />
    </View>
  );
}

function ManualAddSection() {
  const router = useRouter();
  const { session } = useAuth();
  const { create, isSubmitting } = useCreateCustomSubscription();

  const handleSubmit = async (values: ManualSubscriptionFormValues) => {
    const userId = session?.user.id;
    if (!userId) {
      showAlert('ログインが必要です', '再度ログインしてからお試しください。');
      return;
    }

    try {
      await create({
        serviceName: values.serviceName,
        planName: values.planName,
        price: values.price,
        cycle: values.cycle,
        startDate: values.startDate,
        trialEndsOn: values.trialEndsOn,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigateToHomeAfterAdd(router);
    } catch (error) {
      if (error instanceof Error && error.message === 'DUPLICATE_SERVICE') {
        showAlert('登録できません', '同じ名前のサブスクがすでに登録されています。');
        return;
      }
      showAlert('登録に失敗しました', '通信環境を確認して再度お試しください。');
    }
  };

  return <ManualSubscriptionForm isSubmitting={isSubmitting} onSubmit={handleSubmit} />;
}
