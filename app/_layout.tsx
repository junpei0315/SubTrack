import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/components/auth/AuthProvider';
import { AnimatedSplashOverlay } from '@/components/branding/AnimatedSplashOverlay';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDevAuthReady } from '@/hooks/useDevAuthReady';

export const unstable_settings = {
  anchor: '(tabs)',
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
  const colorScheme = useColorScheme();
  const [isSplashDone, setIsSplashDone] = useState(false);
  const isDevAuthReady = useDevAuthReady();

  if (!isDevAuthReady) {
    return (
      <View style={styles.bootstrapping}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <View style={styles.root}>
          <RootNavigator />
          {!isSplashDone ? (
            <AnimatedSplashOverlay onFinish={() => setIsSplashDone(true)} />
          ) : null}
        </View>
        <StatusBar style={isSplashDone ? 'auto' : 'light'} />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bootstrapping: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
});
