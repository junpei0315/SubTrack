import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/subscriptions/screens/SubscriptionListScreen.tsx を実装して差し替える
// 関連機能: 一覧表示 / F-04（削除導線） / F-08（使ったボタン）
export default function SubscriptionListRoute() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Subscriptions</ThemedText>
      <ThemedText>サブスク一覧（未実装）</ThemedText>
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
