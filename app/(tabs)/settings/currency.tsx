import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/settings/screens/CurrencySettingScreen.tsx を実装して差し替える
// 関連機能: F-13（通貨・表示形式の設定）
export default function CurrencySettingsRoute() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Currency</ThemedText>
      <ThemedText>通貨設定（未実装）</ThemedText>
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
