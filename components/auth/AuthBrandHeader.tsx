import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect } from 'react-native-svg';

const ICON_VIEW_SIZE = 240;
const CORNER_RADIUS = ICON_VIEW_SIZE * 0.22;
const GRAPH_POINTS = '44,148 72,116 100,128 155,60 184,76';
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
  baseline: '#2A2A2A',
} as const;

/**
 * 認証画面用ブランドヘッダー。スプラッシュと同じアイコン・ワードマーク・キャッチコピーを静的表示する。
 */
export function AuthBrandHeader() {
  return (
    <View className="items-center gap-4 pb-2">
      <Svg width={148} height={148} viewBox={`0 0 ${ICON_VIEW_SIZE} ${ICON_VIEW_SIZE}`}>
        <Rect width={ICON_VIEW_SIZE} height={ICON_VIEW_SIZE} rx={CORNER_RADIUS} fill={COLORS.iconBackground} />
        <Rect
          width={ICON_VIEW_SIZE}
          height={ICON_VIEW_SIZE}
          rx={CORNER_RADIUS}
          fill="none"
          stroke={COLORS.border}
          strokeWidth={3.5}
        />
        <Polyline
          points={GRAPH_POINTS}
          fill="none"
          stroke={COLORS.line}
          strokeWidth={6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={PEAK_X} cy={PEAK_Y} r={10} fill="white" />
        <Line x1={36} y1={196} x2={204} y2={196} stroke={COLORS.baseline} strokeWidth={1.5} />
        {DOT_XS.map((cx, index) => (
          <Circle key={cx} cx={cx} cy={DOT_Y} r={11} fill={DOT_FILLS[index]} />
        ))}
      </Svg>

      <View className="items-center gap-1.5">
        <Text
          className="text-[28px] font-extrabold tracking-wide text-foreground"
          accessibilityRole="header"
        >
          Sub<Text style={{ color: COLORS.accent }}>Track</Text>
        </Text>
        <Text className="text-base font-bold tracking-wide text-subtle">Track Your Subscriptions</Text>
      </View>
    </View>
  );
}
