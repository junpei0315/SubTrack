import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

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
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title">新規登録</ThemedText>
          <ThemedText style={styles.subtitle}>アカウントを作成して始めましょう</ThemedText>

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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    padding: 24,
    gap: 8,
  },
  subtitle: {
    marginBottom: 16,
  },
});
