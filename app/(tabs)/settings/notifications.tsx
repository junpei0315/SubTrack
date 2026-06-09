import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/notifications/screens/NotificationSettingsScreen.tsx を実装して差し替える
// 関連機能: F-10（更新日リマインド） / F-12（通知タイミング設定）
export default function NotificationSettingsRoute() {
  return (
    <ThemedView className="flex-1 items-center justify-center gap-2 p-4">
      <ThemedText type="title">Notifications</ThemedText>
      <ThemedText>通知設定（未実装）</ThemedText>
    </ThemedView>
  );
}
