import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

import { PresetListItem } from '@/components/subscriptions/PresetListItem';
import { SubscriptionSearchBar } from '@/components/subscriptions/SubscriptionSearchBar';
import { usePresetList } from '@/components/subscriptions/usePresetList';
import { AppColors } from '@/constants/colors';

// 関連機能: F-01（プリセット選択で一括登録）
// 人気のサブスク一覧をマスタ（services / plans / categories）から取得して表示する。
export default function SubscriptionPresetsRoute() {
  const [query, setQuery] = useState('');
  const { presets, isLoading, errorMessage, reload } = usePresetList();

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return presets;
    }
    return presets.filter(
      (preset) =>
        preset.name.toLowerCase().includes(keyword) ||
        preset.genre.toLowerCase().includes(keyword)
    );
  }, [presets, query]);

  return (
    <View className="flex-1 bg-background">
      <View className="gap-4 px-4 pt-4">
        <SubscriptionSearchBar value={query} onChangeText={setQuery} />
        <Text className="text-lg font-bold text-foreground">全て</Text>
      </View>

      {isLoading && presets.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={AppColors.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PresetListItem preset={item} />}
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
    </View>
  );
}
