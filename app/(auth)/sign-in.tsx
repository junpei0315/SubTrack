import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// 関連機能: F-14（アカウント管理）/ ログイン
export default function SignInRoute() {
  const { signInWithEmail, signInWithGoogle } = useAuth();

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
          <ThemedText type="title">ログイン</ThemedText>
          <ThemedText style={styles.subtitle}>SubTrack へようこそ</ThemedText>

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
