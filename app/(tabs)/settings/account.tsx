import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { useAuth } from '@/components/auth/AuthProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// 関連機能: F-14（アカウント管理：メール/PW 変更・エクスポート・退会）
export default function AccountSettingsRoute() {
  const { session, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch {
      Alert.alert('ログアウトに失敗しました', 'もう一度お試しください。');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">アカウント</ThemedText>

      <ThemedView style={styles.row}>
        <ThemedText style={styles.label}>メールアドレス</ThemedText>
        <ThemedText type="defaultSemiBold">{session?.user.email ?? '-'}</ThemedText>
      </ThemedView>

      <Pressable
        accessibilityRole="button"
        disabled={isSigningOut}
        onPress={handleSignOut}
        style={({ pressed }) => [styles.signOutButton, { opacity: pressed || isSigningOut ? 0.7 : 1 }]}
      >
        <ThemedText style={styles.signOutLabel} lightColor="#c0392b" darkColor="#ff6b6b">
          {isSigningOut ? 'ログアウト中…' : 'ログアウト'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  row: {
    gap: 4,
  },
  label: {
    fontSize: 14,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: '#c0392b',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
});
