import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LayoutGrid } from '@/components/ui/lucide-wrapper';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// TODO: src/features/dashboard/screens/DashboardScreen.tsx を実装して差し替える
// 関連機能: F-05（月額・年額合計） / F-06（ジャン額別内訳） / F-07（支出推移） / F-11（未使用アラート）
export default function HomeRoute() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemedView style={styles.container}>
      <LayoutGrid size={64} color={colors.tint} />
      <ThemedText type="title">Home</ThemedText>
      <ThemedText>ダッシュボード（未実装）</ThemedText>
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
