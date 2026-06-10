import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/settings/screens/CurrencySettingScreen.tsx を実装して差し替える
// 関連機能: F-13（通貨・表示形式の設定）
export default function CurrencySettingsRoute() {
  return (
    <ThemedView className="flex-1 items-center justify-center gap-2 p-4">
      <ThemedText type="title">Currency</ThemedText>
      <ThemedText>通貨設定（未実装）</ThemedText>
    </ThemedView>
  );
}
