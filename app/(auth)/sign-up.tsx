import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// 関連機能: F-14（アカウント管理）/ 新規登録
export default function SignUpRoute() {
  const { signUpWithEmail, signInWithGoogle } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUp = async (email: string, password: string) => {
    const result = await signUpWithEmail(email, password);
    if (result.needsEmailConfirmation) {
      setSuccessMessage('確認メールを送信しました。メール内のリンクから登録を完了してください。');
    } else {
      setSuccessMessage(null);
    }
  };

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
          <ThemedText type="title">新規登録</ThemedText>
          <ThemedText className="mb-4">アカウントを作成して始めましょう</ThemedText>

          <AuthForm
            submitLabel="登録する"
            onSubmit={handleSignUp}
            onGoogleSignIn={signInWithGoogle}
            successMessage={successMessage}
            footer={
              <Link href="/(auth)/sign-in">
                <ThemedText type="link">すでにアカウントをお持ちの方はこちら</ThemedText>
              </Link>
            }
          />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
