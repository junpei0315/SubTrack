import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useRef } from 'react';
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
    <Animated.View
      className="absolute inset-0 z-[9999] items-center justify-center bg-background-splash"
      style={overlayStyle}
    >
      <SubTrackAnimatedLogo onAnimationComplete={handleAnimationComplete} />
    </Animated.View>
  );
}
