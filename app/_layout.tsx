import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AnimatedSplashOverlay } from '@/components/branding/AnimatedSplashOverlay';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDevAuthReady } from '@/hooks/useDevAuthReady';

// 認証導入までは (tabs) を初期表示にする。AuthProvider 導入後は (auth) へのリダイレクトを (tabs)/_layout に任せる想定。
export const unstable_settings = {
  anchor: '(tabs)',
};

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
      <View style={styles.root}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
        </Stack>
        {!isSplashDone ? (
          <AnimatedSplashOverlay onFinish={() => setIsSplashDone(true)} />
        ) : null}
      </View>
      <StatusBar style={isSplashDone ? 'auto' : 'light'} />
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
  },
});
