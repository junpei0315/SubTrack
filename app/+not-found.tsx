import { Link, Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <ThemedView className="flex-1 items-center justify-center gap-2 p-4">
        <ThemedText type="title">404</ThemedText>
        <ThemedText>このページは存在しません。</ThemedText>
        <Link href="/home" className="mt-3 py-3">
          <ThemedText type="link">ホームに戻る</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}
