import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedView = Animated.createAnimatedComponent(View);

const ICON_SIZE = 240;
const CORNER_RADIUS = ICON_SIZE * 0.22;
const GRAPH_POINTS = '44,148 72,116 100,128 155,60 184,76';
const GRAPH_PATH_LENGTH = 194;
const PEAK_X = 155;
const PEAK_Y = 60;
const DOT_Y = 176;
const DOT_XS = [90, 120, 150] as const;
const DOT_FILLS = ['#E53935', 'rgba(229,57,53,0.45)', 'rgba(229,57,53,0.2)'] as const;

const TIMING = {
  peakStart: 1000,
  peakDuration: 250,
  dotsStart: 1200,
  dotStagger: 180,
  dotDuration: 280,
  wordmarkStart: 2300,
  wordmarkDuration: 550,
  holdAfterWordmark: 1600,
} as const;

const SPLASH_DURATION =
  TIMING.wordmarkStart + TIMING.wordmarkDuration + TIMING.holdAfterWordmark;

const COLORS = {
  iconBackground: '#111111',
  border: '#C0392B',
  line: '#E53935',
  accent: '#E53935',
  baseline: '#2A2A2A',
} as const;

const SPLASH_TEXT_COLOR = Colors.dark.text;
const SPLASH_SUBTITLE_COLOR = Colors.dark.icon;

interface SubTrackAnimatedLogoProps {
  showWordmark?: boolean;
  onAnimationComplete?: () => void;
}

export function SubTrackAnimatedLogo({
  showWordmark = true,
  onAnimationComplete,
}: SubTrackAnimatedLogoProps) {
  const lineProgress = useSharedValue(0);
  const peakOpacity = useSharedValue(0);
  const dot0Opacity = useSharedValue(0);
  const dot1Opacity = useSharedValue(0);
  const dot2Opacity = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(12);
  const onCompleteRef = useRef(onAnimationComplete);

  onCompleteRef.current = onAnimationComplete;

  useEffect(() => {
    const dots = [dot0Opacity, dot1Opacity, dot2Opacity] as const;

    lineProgress.value = 0;
    peakOpacity.value = 0;
    dots.forEach((opacity) => {
      opacity.value = 0;
    });
    wordmarkOpacity.value = 0;
    wordmarkTranslateY.value = 12;

    lineProgress.value = withDelay(
      200,
      withTiming(1, { duration: 900, easing: Easing.bezier(0.4, 0, 0.2, 1) })
    );

    peakOpacity.value = withDelay(
      TIMING.peakStart,
      withTiming(1, { duration: TIMING.peakDuration, easing: Easing.out(Easing.ease) })
    );

    dots.forEach((opacity, index) => {
      opacity.value = withDelay(
        TIMING.dotsStart + index * TIMING.dotStagger,
        withTiming(1, { duration: TIMING.dotDuration, easing: Easing.out(Easing.ease) })
      );
    });

    wordmarkOpacity.value = withDelay(
      TIMING.wordmarkStart,
      withTiming(1, { duration: TIMING.wordmarkDuration, easing: Easing.out(Easing.ease) })
    );

    wordmarkTranslateY.value = withDelay(
      TIMING.wordmarkStart,
      withTiming(0, { duration: TIMING.wordmarkDuration, easing: Easing.out(Easing.cubic) })
    );

    const completeTimer = setTimeout(() => onCompleteRef.current?.(), SPLASH_DURATION);

    return () => clearTimeout(completeTimer);
  }, [
    dot0Opacity,
    dot1Opacity,
    dot2Opacity,
    lineProgress,
    peakOpacity,
    wordmarkOpacity,
    wordmarkTranslateY,
  ]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: GRAPH_PATH_LENGTH * (1 - lineProgress.value),
  }));

  const animatedPeakProps = useAnimatedProps(() => ({
    opacity: peakOpacity.value,
  }));

  const animatedDot0Props = useAnimatedProps(() => ({
    opacity: dot0Opacity.value,
  }));

  const animatedDot1Props = useAnimatedProps(() => ({
    opacity: dot1Opacity.value,
  }));

  const animatedDot2Props = useAnimatedProps(() => ({
    opacity: dot2Opacity.value,
  }));

  const animatedDotPropsList = [animatedDot0Props, animatedDot1Props, animatedDot2Props] as const;

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslateY.value }],
  }));

  return (
    <View className="items-center gap-9">
      <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox={`0 0 ${ICON_SIZE} ${ICON_SIZE}`}>
        <Rect
          width={ICON_SIZE}
          height={ICON_SIZE}
          rx={CORNER_RADIUS}
          fill={COLORS.iconBackground}
        />
        <Rect
          width={ICON_SIZE}
          height={ICON_SIZE}
          rx={CORNER_RADIUS}
          fill="none"
          stroke={COLORS.border}
          strokeWidth={3.5}
        />
        <AnimatedPolyline
          points={GRAPH_POINTS}
          fill="none"
          stroke={COLORS.line}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={GRAPH_PATH_LENGTH}
          animatedProps={animatedLineProps}
        />
        <AnimatedCircle
          cx={PEAK_X}
          cy={PEAK_Y}
          r={10}
          fill="white"
          animatedProps={animatedPeakProps}
        />
        <Line
          x1={36}
          y1={196}
          x2={204}
          y2={196}
          stroke={COLORS.baseline}
          strokeWidth={1.5}
        />
        {DOT_XS.map((cx, index) => (
          <AnimatedCircle
            key={cx}
            cx={cx}
            cy={DOT_Y}
            r={11}
            fill={DOT_FILLS[index]}
            animatedProps={animatedDotPropsList[index]}
          />
        ))}
      </Svg>

      {showWordmark ? (
        <AnimatedView className="items-center gap-2" style={wordmarkStyle}>
          <ThemedText type="title" lightColor={SPLASH_TEXT_COLOR} darkColor={SPLASH_TEXT_COLOR}>
            Sub<Text style={{ color: COLORS.accent }}>Track</Text>
          </ThemedText>
          <ThemedText lightColor={SPLASH_SUBTITLE_COLOR} darkColor={SPLASH_SUBTITLE_COLOR}>
            Track Your Subscriptions
          </ThemedText>
        </AnimatedView>
      ) : null}
    </View>
  );
}
