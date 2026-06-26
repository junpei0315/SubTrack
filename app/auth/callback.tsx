import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { AppColors } from '@/constants/colors';
import { createSessionFromUrl } from '@/src/infrastructure/supabase/createSessionFromUrl';

// メール確認・OAuth のリダイレクト先（subscapp://auth/callback 等）
export default function AuthCallbackRoute() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleCallback() {
      try {
        const url = await Linking.getInitialURL();
        if (!url?.includes('auth/callback')) {
          throw new Error('認証 URL を取得できませんでした');
        }
        await createSessionFromUrl(url);
        if (isMounted) {
          router.replace('/(tabs)/home');
        }
      } catch {
        if (isMounted) {
          setErrorMessage('認証リンクの処理に失敗しました。もう一度お試しください。');
        }
      }
    }

    void handleCallback();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      {errorMessage ? (
        <>
          <Text className="mb-4 text-center text-sm text-error-alt">{errorMessage}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/(auth)/sign-in')}
            className="rounded-full bg-accent px-6 py-3"
          >
            <Text className="text-base font-semibold text-foreground">ログイン画面へ</Text>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator color={AppColors.text} />
      )}
    </View>
  );
}
