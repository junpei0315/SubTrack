import { ScrollView, StyleSheet } from 'react-native';

import { Calendar } from '@/components/calendar/Calendar';
import { MonthlySpending } from '@/components/dashboard/MonthlySpending';
import { UpcomingSubscriptions } from '@/components/dashboard/UpcomingSubscriptions';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/dashboard/screens/DashboardScreen.tsx を実装して差し替える
// 関連機能: F-05（月額・年額合計） / F-06（ジャンル別内訳） / F-07（支出推移） / F-11（未使用アラート）
export default function HomeRoute() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
      <ThemedView style={styles.container}>
        <MonthlySpending />
        <UpcomingSubscriptions />
        <Calendar />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});
