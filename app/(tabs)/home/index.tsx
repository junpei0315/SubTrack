import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Calendar } from '@/components/ui/CalendarUpdated';
import { useUserSubscriptions } from '@/hooks/useUserSubscriptions';

// TODO: src/features/dashboard/screens/DashboardScreen.tsx を実装して差し替える
// 関連機能: F-05（月額・年額合計） / F-06（ジャンル別内訳） / F-07（支出推移） / F-11（未使用アラート）
export default function HomeRoute() {
  const { getSubscriptionsForMonth } = useUserSubscriptions();
  const now = new Date();
  const subscriptions = getSubscriptionsForMonth(now.getFullYear(), now.getMonth() + 1);

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Home</ThemedText>
        <ThemedText>ダッシュボード（未実装）</ThemedText>
        <Calendar subscriptions={subscriptions} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
});
