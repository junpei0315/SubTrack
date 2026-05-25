import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// TODO: src/features/auth/screens/SignUpScreen.tsx を実装して差し替える
// 関連機能: F-14（アカウント管理）
export default function SignUpRoute() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Sign Up</ThemedText>
      <ThemedText>新規登録画面（未実装）</ThemedText>
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
