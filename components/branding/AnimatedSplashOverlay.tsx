import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { SubTrackAnimatedLogo } from '@/components/branding/SubTrackAnimatedLogo';

SplashScreen.preventAutoHideAsync().catch(() => {
  // 開発中のホットリロード等で既に hide 済みの場合がある
});

interface AnimatedSplashOverlayProps {
  onFinish: () => void;
}

export function AnimatedSplashOverlay({ onFinish }: AnimatedSplashOverlayProps) {
  const overlayOpacity = useSharedValue(1);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  const finishSplash = useCallback(() => {
    onFinishRef.current();
  }, []);

  const handleAnimationComplete = useCallback(() => {
    overlayOpacity.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(finishSplash)();
      }
    });
  }, [finishSplash, overlayOpacity]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <SubTrackAnimatedLogo onAnimationComplete={handleAnimationComplete} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});
