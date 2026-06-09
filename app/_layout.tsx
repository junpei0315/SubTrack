import { DarkTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import '../global.css';

import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { AnimatedSplashOverlay } from '@/components/branding/AnimatedSplashOverlay';
import { AppColors } from '@/constants/colors';
import { useDevAuthReady } from '@/hooks/useDevAuthReady';

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

// 認証状態に応じて (auth) / (tabs) のどちらを表示すべきかを制御する。
function useProtectedRoute(): void {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const onAuthScreen = isAuthRoute(segments);

    if (!session && !onAuthScreen) {
      router.replace('/(auth)/sign-in');
    } else if (session && onAuthScreen) {
      router.replace('/(tabs)/home');
    }
  }, [session, isLoading, segments, router]);
}

function RootNavigator() {
  const { isLoading } = useAuth();
  useProtectedRoute();

  // セッション復元中は (tabs) をマウントしない（未ログイン時の home フラッシュ防止）。
  if (isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
    <ThemeProvider value={blackNavigationTheme}>
      <AuthProvider>
        <View style={styles.root}>
          <RootNavigator />
          {!isSplashDone ? (
            <AnimatedSplashOverlay onFinish={() => setIsSplashDone(true)} />
          ) : null}
        </View>
        <StatusBar style="light" />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
});
