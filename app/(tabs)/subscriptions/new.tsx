import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/components/auth/AuthProvider';
import { GenreSelector } from '@/components/subscriptions/GenreSelector';
import {
  ManualSubscriptionForm,
  type ManualSubscriptionFormValues,
} from '@/components/subscriptions/ManualSubscriptionForm';
import {
  PresetDetailModal,
  type PresetSelection,
} from '@/components/subscriptions/PresetDetailModal';
import { PresetListItem } from '@/components/subscriptions/PresetListItem';
import { SubscriptionSearchBar } from '@/components/subscriptions/SubscriptionSearchBar';
import { useCreateCustomSubscription } from '@/components/subscriptions/useCreateCustomSubscription';
import { useCreateSubscriptionFromPreset } from '@/components/subscriptions/useCreateSubscriptionFromPreset';
import { usePresetList } from '@/components/subscriptions/usePresetList';
import { showAlert } from '@/components/ui/confirm';
import { AppColors } from '@/constants/colors';
import { getGenreLabel, type GenreId } from '@/src/domain/genre';
import type { PresetService } from '@/src/domain/preset';

// 関連機能: F-01（プリセット選択で一括登録）/ F-02（カスタム新規追加）
// プリセットから追加 と 手動入力 をページ遷移なしで切り替える。
type AddMode = 'preset' | 'manual';

const MODE_TABS: { id: AddMode; label: string }[] = [
  { id: 'preset', label: 'プリセットから追加' },
  { id: 'manual', label: '手動で入力' },
];

export default function SubscriptionNewRoute() {
  const [mode, setMode] = useState<AddMode>('preset');

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row gap-2 px-4 pt-4">
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

      {mode === 'preset' ? <PresetAddSection /> : <ManualAddSection />}
    </View>
  );
}

function PresetAddSection() {
  const router = useRouter();
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<GenreId | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetService | null>(null);
  const { presets, isLoading, errorMessage, reload } = usePresetList();
  const { create, isSubmitting } = useCreateSubscriptionFromPreset();

  const handleConfirm = async (selection: PresetSelection) => {
    const userId = session?.user.id;
    if (!userId) {
      Alert.alert('ログインが必要です', '再度ログインしてからお試しください。');
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
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedPreset(null);
      router.back();
    } catch {
      Alert.alert('登録に失敗しました', '通信環境を確認して再度お試しください。');
    }
  };

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const genreLabel = genreFilter ? getGenreLabel(genreFilter) : null;

    return presets.filter((preset) => {
      const matchesGenre = genreLabel === null || preset.genre === genreLabel;
      const matchesKeyword = !keyword || preset.name.toLowerCase().includes(keyword);
      return matchesGenre && matchesKeyword;
    });
  }, [presets, query, genreFilter]);

  return (
    <View className="flex-1">
      <View className="gap-4 px-4 pt-4">
        <SubscriptionSearchBar value={query} onChangeText={setQuery} />
      </View>

      <View className="pt-2">
        <GenreSelector selectedId={genreFilter} onChange={setGenreFilter} includeAll />
        <Text className="px-4 pt-2 text-lg font-bold text-foreground">
          {genreFilter ? getGenreLabel(genreFilter) : '全て'}
        </Text>
      </View>

      {isLoading && presets.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={AppColors.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PresetListItem preset={item} onPress={setSelectedPreset} />
          )}
          contentContainerClassName="flex-grow p-4"
          ItemSeparatorComponent={() => <View className="h-3" />}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={reload}
              tintColor={AppColors.accent}
            />
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              {errorMessage ? (
                <Text className="text-sm text-accent">{errorMessage}</Text>
              ) : (
                <Text className="text-sm text-subtle">該当するサブスクがありません</Text>
              )}
            </View>
          }
        />
      )}

      <PresetDetailModal
        preset={selectedPreset}
        visible={selectedPreset !== null}
        isSubmitting={isSubmitting}
        onClose={() => setSelectedPreset(null)}
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
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
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
