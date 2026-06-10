import { ScrollView } from 'react-native';

import { Calendar } from '@/components/calendar/Calendar';
import { MonthlySpending } from '@/components/dashboard/MonthlySpending';
import { UpcomingSubscriptions } from '@/components/dashboard/UpcomingSubscriptions';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/dashboard/screens/DashboardScreen.tsx を実装して差し替える
// 関連機能: F-05（月額・年額合計） / F-06（ジャンル別内訳） / F-07（支出推移） / F-11（未使用アラート）
export default function HomeRoute() {
  return (
    <ScrollView className="flex-1" contentContainerClassName="grow">
      <ThemedView className="flex-1 p-4">
        <MonthlySpending />
        <Calendar />
        <UpcomingSubscriptions />
      </ThemedView>
    </ScrollView>
  );
}
