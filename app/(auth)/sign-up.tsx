import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBrandHeader } from '@/components/auth/AuthBrandHeader';
import { AuthForm } from '@/components/auth/AuthForm';
import { useAuth } from '@/components/auth/AuthProvider';

// 関連機能: F-14（アカウント管理）/ 新規登録
export default function SignUpRoute() {
  const insets = useSafeAreaInsets();
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
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow justify-center px-5 py-8"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-8">
            <AuthBrandHeader />

            <View className="gap-6">
              <Text className="text-2xl font-bold text-foreground">新規登録</Text>

              <AuthForm
                submitLabel="登録する"
                onSubmit={handleSignUp}
                onGoogleSignIn={signInWithGoogle}
                successMessage={successMessage}
                footer={
                  <Link href="/(auth)/sign-in">
                    <Text className="text-base font-semibold text-accent">
                      すでにアカウントをお持ちの方はこちら
                    </Text>
                  </Link>
                }
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
