import { useState } from 'react';
import { Alert, Pressable } from 'react-native';

import { useAuth } from '@/components/auth/AuthProvider';
import { SettingsBackButton } from '@/components/settings/SettingsBackButton';
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
    <ThemedView className="flex-1 gap-6 px-4 pb-6 pt-6">
      <SettingsBackButton />
      <ThemedText type="subtitle">アカウント</ThemedText>

      <ThemedView className="gap-6">
        <ThemedView className="gap-1">
          <ThemedText className="text-sm">メールアドレス</ThemedText>
          <ThemedText type="defaultSemiBold">{session?.user.email ?? '-'}</ThemedText>
        </ThemedView>

        <Pressable
          accessibilityRole="button"
          disabled={isSigningOut}
          onPress={handleSignOut}
          className="items-center rounded-lg border border-sign-out py-3.5"
          style={({ pressed }) => ({ opacity: pressed || isSigningOut ? 0.7 : 1 })}
        >
          <ThemedText className="text-base font-bold" lightColor="#c0392b" darkColor="#ff6b6b">
            {isSigningOut ? 'ログアウト中…' : 'ログアウト'}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}
