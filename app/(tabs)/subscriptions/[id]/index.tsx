import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/subscriptions/screens/SubscriptionDetailScreen.tsx を実装して差し替える
// 関連機能: F-04（削除導線） / F-09（使用頻度・1回あたりコスト）
export default function SubscriptionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Subscription Detail</ThemedText>
      <ThemedText>ID: {id ?? '-'}</ThemedText>
      <ThemedText>詳細画面（未実装）</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
});
