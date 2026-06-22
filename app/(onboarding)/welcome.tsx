import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth/AuthProvider';
import { OnboardingPlanModal } from '@/components/onboarding/OnboardingPlanModal';
import { useOnboarding } from '@/components/onboarding/OnboardingProvider';
import { useOnboardingRegister } from '@/components/onboarding/useOnboardingRegister';
import { filterPresets } from '@/components/subscriptions/filterPresets';
import { PresetGridList } from '@/components/subscriptions/PresetGridList';
import { PresetPickerFilters } from '@/components/subscriptions/PresetPickerFilters';
import { usePresetList } from '@/components/subscriptions/usePresetList';
import { AppColors } from '@/constants/colors';
import type { PresetSelectionInput } from '@/src/application/createSubscriptionsFromPresets';
import { type GenreId } from '@/src/domain/genre';
import type { PresetService } from '@/src/domain/preset';

export default function OnboardingWelcomeRoute() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const { markCompletedLocally } = useOnboarding();
  const { presets, isLoading, errorMessage, reload } = usePresetList();
  const { register, isSubmitting } = useOnboardingRegister();

  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<GenreId | null>(null);
  /** サービス ID → 選択したプラン ID */
  const [selectedPlans, setSelectedPlans] = useState<Map<string, string>>(() => new Map());
  const [activePreset, setActivePreset] = useState<PresetService | null>(null);

  const selectablePresets = useMemo(
    () => presets.filter((preset) => preset.plans.length > 0),
    [presets]
  );

  const filtered = useMemo(
    () => filterPresets(selectablePresets, query, genreFilter),
    [selectablePresets, query, genreFilter]
  );

  const selectPlan = (preset: PresetService, planId: string | null) => {
    setSelectedPlans((prev) => {
      const next = new Map(prev);
      if (!planId) {
        next.delete(preset.id);
        return next;
      }
      next.set(preset.id, planId);
      return next;
    });
  };

  const selectedCount = selectedPlans.size;

  const buildSelections = (): PresetSelectionInput[] => {
    const today = new Date();
    const selections: PresetSelectionInput[] = [];

    selectablePresets.forEach((preset) => {
      const planId = selectedPlans.get(preset.id);
      if (!planId) {
        return;
      }
      const plan = preset.plans.find((p) => p.id === planId);
      if (!plan) {
        return;
      }
      selections.push({ planId: plan.id, cycle: plan.cycle, startDate: today });
    });

    return selections;
  };

  const handleRegister = async () => {
    const userId = session?.user.id;
    if (!userId) {
      Alert.alert('ログインが必要です', '再度ログインしてからお試しください。');
      return;
    }

    try {
      await register(userId, buildSelections());
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      markCompletedLocally();
    } catch {
      Alert.alert('登録に失敗しました', '通信環境を確認して再度お試しください。');
    }
  };

  const handleSkip = () => {
    // 何も登録せずホームへ。サブスクが 0 件のままなら次回ログイン時に再表示される。
    markCompletedLocally();
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="gap-1.5 px-5 pb-2 pt-4">
        <Text className="text-2xl font-bold text-foreground">ようこそ SubTrack へ</Text>
        <Text className="text-sm text-subtle">
          {"いま使っているサブスクを選んで、まとめて登録しましょう。 \nあとからいつでも変更できます。"}
        </Text>
      </View>

      <PresetPickerFilters
        query={query}
        onQueryChange={setQuery}
        genreFilter={genreFilter}
        onGenreChange={setGenreFilter}
      />

      <PresetGridList
        presets={filtered}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onPresetPress={setActivePreset}
        onReload={reload}
        getSelected={(preset) => selectedPlans.has(preset.id)}
        showEmptyReloadButton
      />

      <OnboardingPlanModal
        preset={activePreset}
        visible={activePreset !== null}
        selectedPlanId={activePreset ? selectedPlans.get(activePreset.id) ?? null : null}
        isSubmitting={isSubmitting}
        onClose={() => setActivePreset(null)}
        onConfirm={(planId) => {
          if (activePreset) {
            selectPlan(activePreset, planId);
          }
          setActivePreset(null);
        }}
      />

      <View
        className="gap-3 border-t border-border bg-background-darker px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isSubmitting}
          onPress={selectedCount > 0 ? handleRegister : handleSkip}
          className={`flex-row items-center justify-center gap-2 rounded-full py-4 ${
            isSubmitting ? 'bg-white/[0.08]' : 'bg-accent'
          }`}
        >
          {isSubmitting ? <ActivityIndicator color={AppColors.text} size="small" /> : null}
          <Text className="text-base font-bold text-foreground">
            {isSubmitting
              ? '登録中...'
              : selectedCount > 0
                ? `選んだ${selectedCount}件を登録`
                : 'スキップしてはじめる'}
          </Text>
        </TouchableOpacity>

        {selectedCount > 0 && !isSubmitting ? (
          <TouchableOpacity activeOpacity={0.7} onPress={handleSkip} className="items-center py-1">
            <Text className="text-sm font-semibold text-subtle">あとで登録する</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
