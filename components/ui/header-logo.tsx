import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// スプラッシュ（SubTrackAnimatedLogo）と同じ配色のワードマーク。
const SUB_COLOR = '#ECEDEE';
const ACCENT = '#E53935';
const SUBTITLE_COLOR = '#9BA1A6';

const BAR_HEIGHT = 2;
const ANIM_AREA_HEIGHT = 8;
const BAR_DURATION = 700;

const RING_COUNT = 3;
const RING_MAX = 22;
const RING_DURATION = 1600;

/**
 * ヘッダーのワードマーク。スプラッシュと同じ「Sub」+「Track」のベクターテキストと
 * 小さなサブタイトルを描画し、ワードマークの下に左下→右下へ伸びる棒と、
 * 右端（Track の末尾）から広がる同心円アニメーションを流し続ける。
 */
export function HeaderLogo() {
  const [logoWidth, setLogoWidth] = useState(0);

  const barProgress = useRef(new Animated.Value(0)).current;

  const ringsRef = useRef<Animated.Value[]>(undefined);
  if (!ringsRef.current) {
    ringsRef.current = Array.from({ length: RING_COUNT }, () => new Animated.Value(0));
  }
  const rings = ringsRef.current;

  useEffect(() => {
    if (logoWidth === 0) {
      return;
    }

    const ringLoops: Animated.CompositeAnimation[] = [];
    const timers: ReturnType<typeof setTimeout>[] = [];

    const startRipple = () => {
      rings.forEach((value, index) => {
        const timer = setTimeout(
          () => {
            const loop = Animated.loop(
              Animated.timing(value, {
                toValue: 1,
                duration: RING_DURATION,
                easing: Easing.out(Easing.ease),
                useNativeDriver: false,
              }),
            );
            ringLoops.push(loop);
            loop.start();
          },
          (index * RING_DURATION) / RING_COUNT,
        );
        timers.push(timer);
      });
    };

    barProgress.setValue(0);
    const bar = Animated.timing(barProgress, {
      toValue: 1,
      duration: BAR_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    });

    bar.start();
    // 同心円は常時出し続ける（棒の描画完了は待たない）。
    startRipple();

    return () => {
      bar.stop();
      ringLoops.forEach((loop) => loop.stop());
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [barProgress, rings, logoWidth]);

  const onLayout = (event: LayoutChangeEvent) => {
    const width = Math.round(event.nativeEvent.layout.width);
    if (width !== logoWidth) {
      setLogoWidth(width);
    }
  };

  const barWidth = barProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, logoWidth],
  });

  const barCenterY = ANIM_AREA_HEIGHT / 2;

  return (
    <View style={styles.container}>
      <Text style={styles.wordmark} onLayout={onLayout} accessibilityRole="header">
        <Text style={styles.sub}>Sub</Text>
        <Text style={styles.track}>Track</Text>
      </Text>

      <View style={[styles.animArea, { width: logoWidth || undefined }]} pointerEvents="none">
        <Animated.View
          style={[styles.bar, { top: barCenterY - BAR_HEIGHT / 2, width: barWidth }]}
        />

        {logoWidth > 0 &&
          rings.map((value, index) => {
            const scale = value.interpolate({
              inputRange: [0, 1],
              outputRange: [0.15, 1],
            });
            const opacity = value.interpolate({
              inputRange: [0, 0.12, 1],
              outputRange: [0, 0.85, 0],
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.ring,
                  {
                    left: logoWidth - RING_MAX / 2,
                    top: barCenterY - RING_MAX / 2,
                    opacity,
                    transform: [{ scale }],
                  },
                ]}
              />
            );
          })}
      </View>

      <Text style={styles.subtitle}>Track Your Subscriptions</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    overflow: 'visible',
  },
  wordmark: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 30,
  },
  sub: {
    color: SUB_COLOR,
  },
  track: {
    color: ACCENT,
  },
  animArea: {
    height: ANIM_AREA_HEIGHT,
    marginTop: -1,
    overflow: 'visible',
  },
  subtitle: {
    fontSize: 11,
    color: SUBTITLE_COLOR,
    letterSpacing: 0.3,
    marginTop: -1,
  },
  bar: {
    position: 'absolute',
    left: 0,
    height: BAR_HEIGHT,
    borderRadius: BAR_HEIGHT / 2,
    backgroundColor: ACCENT,
  },
  ring: {
    position: 'absolute',
    width: RING_MAX,
    height: RING_MAX,
    borderRadius: RING_MAX / 2,
    borderWidth: 2,
    borderColor: ACCENT,
  },
});
