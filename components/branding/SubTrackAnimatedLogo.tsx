import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';

const AnimatedPolyline = Animated.createAnimatedComponent(Polyline);
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

const COLORS = {
  iconBackground: '#111111',
  border: '#C0392B',
  line: '#E53935',
  accent: '#E53935',
  subtitle: '#666666',
  baseline: '#2A2A2A',
} as const;

interface SubTrackAnimatedLogoProps {
  showWordmark?: boolean;
  onAnimationComplete?: () => void;
}

export function SubTrackAnimatedLogo({
  showWordmark = true,
  onAnimationComplete,
}: SubTrackAnimatedLogoProps) {
  const lineProgress = useSharedValue(0);
  const wordmarkOpacity = useSharedValue(0);
  const wordmarkTranslateY = useSharedValue(12);
  const onCompleteRef = useRef(onAnimationComplete);
  const [phase, setPhase] = useState(0);

  onCompleteRef.current = onAnimationComplete;

  useEffect(() => {
    setPhase(0);
    lineProgress.value = 0;
    wordmarkOpacity.value = 0;
    wordmarkTranslateY.value = 12;

    lineProgress.value = withDelay(
      200,
      withTiming(1, { duration: 900, easing: Easing.bezier(0.4, 0, 0.2, 1) })
    );

    const timers = [
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 1380),
      setTimeout(() => setPhase(4), 1560),
      setTimeout(() => {
        setPhase(5);
        wordmarkOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
        wordmarkTranslateY.value = withTiming(0, { duration: 400, easing: Easing.out(Easing.ease) });
      }, 1700),
      setTimeout(() => onCompleteRef.current?.(), 2700),
    ];

    return () => timers.forEach(clearTimeout);
  }, [lineProgress, wordmarkOpacity, wordmarkTranslateY]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDashoffset: GRAPH_PATH_LENGTH * (1 - lineProgress.value),
  }));

  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmarkOpacity.value,
    transform: [{ translateY: wordmarkTranslateY.value }],
  }));

  return (
    <View style={styles.container}>
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
        <Circle
          cx={PEAK_X}
          cy={PEAK_Y}
          r={10}
          fill="white"
          opacity={phase >= 1 ? 1 : 0}
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
          <Circle
            key={cx}
            cx={cx}
            cy={DOT_Y}
            r={11}
            fill={DOT_FILLS[index]}
            opacity={phase >= index + 2 ? 1 : 0}
          />
        ))}
      </Svg>

      {showWordmark ? (
        <AnimatedView style={[styles.wordmarkContainer, wordmarkStyle]}>
          <Text style={styles.wordmark}>
            Sub<Text style={styles.wordmarkAccent}>Track</Text>
          </Text>
          <Text style={styles.subtitle}>Track Your Subscriptions</Text>
        </AnimatedView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 36,
  },
  wordmarkContainer: {
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1.5,
    color: '#FFFFFF',
  },
  wordmarkAccent: {
    color: COLORS.accent,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.subtitle,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
