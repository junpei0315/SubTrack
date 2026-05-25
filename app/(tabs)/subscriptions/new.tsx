import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/subscriptions/screens/SubscriptionNewScreen.tsx を実装して差し替える
// 関連機能: F-02（カスタム新規追加）
export default function SubscriptionNewRoute() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">New Subscription</ThemedText>
      <ThemedText>新規登録フォーム（未実装）</ThemedText>
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
