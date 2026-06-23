import { DarkTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Image } from 'expo-image';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { cssInterop } from 'nativewind';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import '../global.css';

import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { AnimatedSplashOverlay } from '@/components/branding/AnimatedSplashOverlay';
import { OnboardingProvider, useOnboarding } from '@/components/onboarding/OnboardingProvider';
import { AppColors } from '@/constants/colors';
import { useDevAuthReady } from '@/hooks/useDevAuthReady';

// expo-image は RN コア外のため、NativeWind の className を style にマッピングするには
// cssInterop の登録が必要（未登録だと className="h-full w-full" 等が無視されロゴが表示されない）。
cssInterop(Image, { className: { target: 'style' } });

export const unstable_settings = {
  anchor: '(tabs)',
};

const blackNavigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: AppColors.background,
    card: AppColors.background,
  },
};

const AUTH_ROUTE_NAMES = new Set(['sign-in', 'sign-up']);

/**
 * 現在のルートが認証画面かどうか。
 * Web ではグループ名が URL に出ないため `/sign-up` は segments が `['sign-up']` になる。
 * `segments[0] === '(auth)'` だけでは判定漏れする。
 */
function isAuthRoute(segments: string[]): boolean {
  if (segments[0] === '(auth)') {
    return true;
  }
  return AUTH_ROUTE_NAMES.has(segments[0] ?? '');
}

// Web ではグループ名が URL に出ないため、`/welcome` は segments が ['welcome'] になる。
function isOnboardingRoute(segments: string[]): boolean {
  return segments[0] === '(onboarding)' || segments[0] === 'welcome';
}

// 認証・オンボーディング状態に応じて (auth) / (onboarding) / (tabs) を制御する。
function useProtectedRoute(): void {
  const { session, isLoading } = useAuth();
  const { isResolving, needsOnboarding } = useOnboarding();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const onAuthScreen = isAuthRoute(segments);
    const onOnboardingScreen = isOnboardingRoute(segments);

    if (!session) {
      if (!onAuthScreen) {
        router.replace('/(auth)/sign-in');
      }
      return;
    }

    // ログイン済み。プロフィール（オンボーディング状態）の解決を待つ。
    if (isResolving) {
      return;
    }

    if (needsOnboarding) {
      if (!onOnboardingScreen) {
        router.replace('/(onboarding)/welcome');
      }
    } else if (onAuthScreen || onOnboardingScreen) {
      router.replace('/(tabs)/home');
    }
  }, [session, isLoading, isResolving, needsOnboarding, segments, router]);
}

function RootNavigator() {
  const { isLoading } = useAuth();
  useProtectedRoute();

  // セッション復元中のみ (tabs) をマウントしない（未ログイン時の home フラッシュ防止）。
  // オンボーディング判定中はナビゲーターをアンマウントしない。アンマウントすると
  // Web で URL とナビゲーション状態の同期が壊れ、パスを変えても画面が追従しなくなる。
  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [isSplashDone, setIsSplashDone] = useState(false);
  const isDevAuthReady = useDevAuthReady();

  if (!isDevAuthReady) {
    // 開発用自動サインイン完了まで黒画面を維持（スプラッシュと同色でチラつきを防ぐ）
    return <View style={styles.root} />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={blackNavigationTheme}>
        <AuthProvider>
          <OnboardingProvider>
            <View style={styles.root}>
              <RootNavigator />
              {!isSplashDone ? (
                <AnimatedSplashOverlay onFinish={() => setIsSplashDone(true)} />
              ) : null}
            </View>
            <StatusBar style="light" />
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
});
