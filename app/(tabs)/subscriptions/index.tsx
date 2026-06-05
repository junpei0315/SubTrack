import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const DEV_SUBSCRIPTIONS = [
  { id: '55555555-0000-0000-0000-000000000001', name: 'Netflix' },
  { id: '55555555-0000-0000-0000-000000000002', name: 'Amazon Prime Video' },
  { id: '55555555-0000-0000-0000-000000000003', name: 'DAZN' },
] as const;

// TODO: src/features/subscriptions/screens/SubscriptionListScreen.tsx を実装して差し替える
// 関連機能: 一覧表示 / F-04（削除導線） / F-08（使ったボタン）
export default function SubscriptionListRoute() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Subscriptions</ThemedText>
      <ThemedText>サブスク一覧（未実装）</ThemedText>
      {__DEV__ ? (
        <ThemedView style={styles.devLinks}>
          <ThemedText type="subtitle">開発用（本番テストデータ）</ThemedText>
          {DEV_SUBSCRIPTIONS.map((item) => (
            <Link key={item.id} href={`/subscriptions/${item.id}`} style={styles.link}>
              <ThemedText type="link">{item.name}</ThemedText>
            </Link>
          ))}
        </ThemedView>
      ) : null}
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
  devLinks: {
    marginTop: 24,
    alignItems: 'center',
    gap: 8,
  },
  link: {
    paddingVertical: 4,
  },
});
