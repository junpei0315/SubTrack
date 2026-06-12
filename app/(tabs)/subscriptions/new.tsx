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

import { GenreSelector } from '@/components/subscriptions/GenreSelector';
import {
  PresetDetailModal,
  type PresetSelection,
} from '@/components/subscriptions/PresetDetailModal';
import { PresetListItem } from '@/components/subscriptions/PresetListItem';
import { SubscriptionSearchBar } from '@/components/subscriptions/SubscriptionSearchBar';
import { usePresetList } from '@/components/subscriptions/usePresetList';
import { AppColors } from '@/constants/colors';
import { formatBillingDate } from '@/src/domain/billingCycle';
import { DEFAULT_GENRE_ID, getGenreLabel, type GenreId } from '@/src/domain/genre';
import { formatPrice } from '@/src/domain/money';
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
  const [query, setQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState<GenreId | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetService | null>(null);
  const { presets, isLoading, errorMessage, reload } = usePresetList();

  const handleConfirm = (selection: PresetSelection) => {
    setSelectedPreset(null);
    // TODO(F-01): サブスク登録ユースケースが実装されたら永続化処理に差し替える。
    Alert.alert(
      '追加内容の確認',
      `${selection.preset.name}（${selection.plan.name}）\n` +
        `料金: ${formatPrice(selection.price, selection.plan.currency)}\n` +
        `支払い開始日: ${formatBillingDate(selection.startDate)}`
    );
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
        onClose={() => setSelectedPreset(null)}
        onConfirm={handleConfirm}
      />
    </View>
  );
}

function ManualAddSection() {
  const [genreId, setGenreId] = useState<GenreId>(DEFAULT_GENRE_ID);

  return (
    <View className="flex-1 pt-6">
      <View className="gap-3">
        <Text className="px-4 text-lg font-bold text-foreground">ジャンル</Text>
        <GenreSelector selectedId={genreId} onChange={(id) => id && setGenreId(id)} />
      </View>
    </View>
  );
}
