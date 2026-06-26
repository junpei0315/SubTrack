import { useRouter } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';

import { SettingsBackButton } from '@/components/settings/SettingsBackButton';
import { useLineLink } from '@/components/settings/useLineLink';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/settings/screens/SettingsTopScreen.tsx を実装して差し替える
// 関連機能: F-14 への導線（通知はヘッダーのベルから）
export default function SettingsRoute() {
  const router = useRouter();
  const { isLinked } = useLineLink();

  return (
    <ScrollView className="flex-1">
      <ThemedView className="flex-1 gap-6 px-4 pb-4 pt-6">
        <SettingsBackButton />
        <ThemedText type="subtitle">設定</ThemedText>

        <ThemedView className="gap-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/settings/line-link')}
            className="rounded-xl border border-white/10 px-4 py-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <ThemedText type="defaultSemiBold" className="text-base">
              LINE 連携
            </ThemedText>
            <ThemedText className="text-sm opacity-70">
              {isLinked ? '連携済み' : '公式アカウントと連携'}
            </ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/settings/account')}
            className="rounded-xl border border-white/10 px-4 py-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <ThemedText type="defaultSemiBold" className="text-base">
              アカウント
            </ThemedText>
            <ThemedText className="text-sm opacity-70">ログアウト・退会など</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}
