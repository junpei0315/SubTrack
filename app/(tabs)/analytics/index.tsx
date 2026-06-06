import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: 分析画面を実装する
// 関連機能: F-06（ジャンル別内訳） / F-07（支出推移） / F-11（未使用アラート）
export default function AnalyticsRoute() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">分析</ThemedText>
      <ThemedText>分析（未実装）</ThemedText>
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
