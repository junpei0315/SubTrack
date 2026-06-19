import { Link } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthProvider';

// 関連機能: F-14（アカウント管理）/ ログイン
export default function SignInRoute() {
  const insets = useSafeAreaInsets();
  const { signInWithEmail, signInWithGoogle } = useAuth();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center px-5 py-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-1.5 pb-6">
            <Text className="text-2xl font-bold text-foreground">ログイン</Text>
            <Text className="text-sm text-subtle">SubTrack へようこそ</Text>
          </View>

          <AuthForm
            submitLabel="ログイン"
            onSubmit={signInWithEmail}
            onGoogleSignIn={signInWithGoogle}
            footer={
              <Link href="/(auth)/sign-up">
                <Text className="text-base font-semibold text-accent">
                  アカウントをお持ちでない方はこちら
                </Text>
              </Link>
            }
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
