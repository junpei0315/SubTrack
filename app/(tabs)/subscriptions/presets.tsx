import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { SubscriptionSearchBar } from '@/components/subscriptions/SubscriptionSearchBar';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/subscriptions/screens/SubscriptionPresetsScreen.tsx を実装して差し替える
// 関連機能: F-01（プリセット選択で一括登録）
export default function SubscriptionPresetsRoute() {
  const [query, setQuery] = useState('');

  return (
    <ThemedView style={styles.container}>
      <SubscriptionSearchBar value={query} onChangeText={setQuery} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
});
