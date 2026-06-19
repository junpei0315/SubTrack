/** 分析グラフ用のセグメントカラー（ダーク UI 向け） */
export const CHART_SEGMENT_COLORS = [
  '#DC052D',
  '#7c3aed',
  '#1db954',
  '#4285f4',
  '#ff6b35',
  '#f4a261',
  '#5865f2',
  '#10a37f',
  '#e91e63',
  '#6366f1',
  '#64748b',
] as const;

export function getChartColor(index: number): string {
  return CHART_SEGMENT_COLORS[index % CHART_SEGMENT_COLORS.length] ?? '#9aa0a6';
}
