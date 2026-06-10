import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/subscriptions/screens/SubscriptionEditScreen.tsx を実装して差し替える
// 関連機能: F-03（編集 / paused トグル）
export default function SubscriptionEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ThemedView className="flex-1 items-center justify-center gap-2 p-4">
      <ThemedText type="title">Edit Subscription</ThemedText>
      <ThemedText>ID: {id ?? '-'}</ThemedText>
      <ThemedText>編集フォーム（未実装）</ThemedText>
    </ThemedView>
  );
}
