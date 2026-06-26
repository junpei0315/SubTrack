import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBrandHeader } from '@/components/auth/AuthBrandHeader';
import { useProductTour } from '@/components/productTour/ProductTourProvider';
import { markProductTourPending } from '@/components/productTour/productTourStorage';

// 新規登録直後: メール確認の案内を出しつつアプリへ進める画面
export default function RegistrationCompleteRoute() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { startTour } = useProductTour();

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

            <View className="gap-4">
              <Text className="text-center text-2xl font-bold text-foreground">メールをご確認ください</Text>
              <Text className="text-center text-[15px] leading-6 text-muted">
                確認メールを送信しました。メール内のリンクをタップすると、メールアドレスの確認が完了します。
              </Text>

              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  markProductTourPending();
                  router.replace('/(tabs)/home');
                  startTour();
                }}
                className="mt-2 items-center justify-center rounded-full bg-accent py-4 active:opacity-85"
              >
                <Text className="text-base font-bold text-foreground">アプリをはじめる</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
