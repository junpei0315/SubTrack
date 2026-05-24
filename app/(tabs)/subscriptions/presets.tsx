import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/subscriptions/screens/SubscriptionPresetsScreen.tsx を実装して差し替える
// 関連機能: F-01（プリセット選択で一括登録）
export default function SubscriptionPresetsRoute() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Presets</ThemedText>
      <ThemedText>プリセット選択（未実装）</ThemedText>
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
