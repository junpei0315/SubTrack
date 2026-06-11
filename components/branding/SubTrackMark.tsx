import Svg, { Circle, Polyline } from 'react-native-svg';

/**
 * SubTrack のブランドマーク（折れ線グラフ＋ドット）。スプラッシュのアイコンと同じ造形を、
 * 背景の黒い角丸を外して要素だけで描画する。透明背景なのでヘッダーにそのまま馴染む。
 */

// スプラッシュ（SubTrackAnimatedLogo）と同じ座標・配色。
const ACCENT = '#E53935';
const GRAPH_POINTS = '44,148 72,116 100,128 155,60 184,76';
const PEAK = { x: 155, y: 60 };
const DOT_Y = 176;
const DOTS = [
  { x: 90, fill: ACCENT },
  { x: 120, fill: 'rgba(229,57,53,0.45)' },
  { x: 150, fill: 'rgba(229,57,53,0.2)' },
] as const;

// 余白を詰めて要素を中央に寄せたビューボックス。
const VIEWBOX = '24 30 180 180';

interface SubTrackMarkProps {
  size?: number;
}

export function SubTrackMark({ size = 40 }: SubTrackMarkProps) {
  return (
    <Svg width={size} height={size} viewBox={VIEWBOX}>
      <Polyline
        points={GRAPH_POINTS}
        fill="none"
        stroke={ACCENT}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={PEAK.x} cy={PEAK.y} r={10} fill="#ffffff" />
      {DOTS.map((dot) => (
        <Circle key={dot.x} cx={dot.x} cy={DOT_Y} r={11} fill={dot.fill} />
      ))}
    </Svg>
  );
}
