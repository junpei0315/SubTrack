import { useRouter } from 'expo-router';
import { Pressable, ScrollView } from 'react-native';

import { LineLinkCard } from '@/components/settings/LineLinkCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/settings/screens/SettingsTopScreen.tsx を実装して差し替える
// 関連機能: F-12 / F-13 / F-14 への導線
export default function SettingsRoute() {
  const router = useRouter();

  return (
    <ScrollView className="flex-1">
      <ThemedView className="flex-1 gap-2 p-4">
        <ThemedText type="title">設定</ThemedText>

        <ThemedView className="gap-2">
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/settings/notifications')}
            className="rounded-xl border border-white/10 px-4 py-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <ThemedText type="defaultSemiBold" className="text-base">
              通知
            </ThemedText>
            <ThemedText className="text-sm opacity-70">通知タイミングの設定</ThemedText>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/(tabs)/settings/currency')}
            className="rounded-xl border border-white/10 px-4 py-4"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <ThemedText type="defaultSemiBold" className="text-base">
              通貨・表示形式
            </ThemedText>
            <ThemedText className="text-sm opacity-70">通貨や表示形式の設定</ThemedText>
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

        <LineLinkCard />
      </ThemedView>
    </ScrollView>
  );
}
