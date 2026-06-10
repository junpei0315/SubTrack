import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// 関連機能: F-14（アカウント管理）/ ログイン
export default function SignInRoute() {
  const { signInWithEmail, signInWithGoogle } = useAuth();

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center"
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView className="gap-2 p-6">
          <ThemedText type="title">ログイン</ThemedText>
          <ThemedText className="mb-4">SubTrack へようこそ</ThemedText>

          <AuthForm
            submitLabel="ログイン"
            onSubmit={signInWithEmail}
            onGoogleSignIn={signInWithGoogle}
            footer={
              <Link href="/(auth)/sign-up">
                <ThemedText type="link">アカウントをお持ちでない方はこちら</ThemedText>
              </Link>
            }
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
