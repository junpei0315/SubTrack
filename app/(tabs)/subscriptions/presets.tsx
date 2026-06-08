import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { PresetListItem } from '@/components/subscriptions/PresetListItem';
import { SubscriptionSearchBar } from '@/components/subscriptions/SubscriptionSearchBar';
import { usePresetList } from '@/components/subscriptions/usePresetList';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <SubscriptionSearchBar value={query} onChangeText={setQuery} />
        <Text style={styles.sectionTitle}>全て</Text>
      </View>

      {isLoading && presets.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color="#ff3a5e" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PresetListItem preset={item} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={reload} tintColor="#ff3a5e" />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrapper}>
              {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
              ) : (
                <Text style={styles.emptyTitle}>該当するサブスクがありません</Text>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}

const BACKGROUND_COLOR = '#0f0f0f';
const TEXT_COLOR = '#ffffff';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  sectionTitle: {
    color: TEXT_COLOR,
    fontSize: 18,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  separator: {
    height: 12,
  },
  emptyWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    color: '#9aa0a6',
    fontSize: 14,
  },
  errorText: {
    color: '#ff3a5e',
    fontSize: 14,
  },
});
