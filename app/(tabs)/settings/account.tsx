import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/settings/screens/AccountScreen.tsx を実装して差し替える
// 関連機能: F-14（アカウント管理：メール/PW 変更・エクスポート・退会）
export default function AccountSettingsRoute() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Account</ThemedText>
      <ThemedText>アカウント管理（未実装）</ThemedText>
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
