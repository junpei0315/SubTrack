/**
 * 利用頻度・コスト表示（F-09）のドメイン型と純粋関数。
 * 利用実績データ連携前はモックスナップショットで UI を検証する。
 */

export interface UsageBarDatum {
  /** 棒グラフの相対高さ（0〜1） */
  normalizedHeight: number;
  isHighlighted: boolean;
}

export interface UsageFrequencySnapshot {
  bars: UsageBarDatum[];
  /** 月あたり平均利用時間（時間）。データ不足時は null */
  averageHoursPerMonth: number | null;
  /** 1 時間あたりコスト（円）。算出不可時は null */
  costPerHourYen: number | null;
  /** 登録直後などで集計できない */
  isAccumulating: boolean;
}

/**
 * 1 時間あたりのコスト = 月額 ÷ 月あたり平均利用時間（時間）
 */
export function computeCostPerHourYen(
  monthlyPriceYen: number,
  averageHoursPerMonth: number
): number | null {
  if (averageHoursPerMonth <= 0 || monthlyPriceYen < 0) {
    return null;
  }
  return Math.round(monthlyPriceYen / averageHoursPerMonth);
}

export function formatAverageUsageHours(hours: number): string {
  return `${hours} 時間/月`;
}

export function formatCostPerHourYen(yen: number): string {
  return `¥${yen.toLocaleString('ja-JP')}`;
}

const MOCK_BARS: UsageBarDatum[] = [
  { normalizedHeight: 0.35, isHighlighted: false },
  { normalizedHeight: 0.55, isHighlighted: false },
  { normalizedHeight: 1, isHighlighted: true },
  { normalizedHeight: 0.7, isHighlighted: false },
  { normalizedHeight: 0.45, isHighlighted: false },
  { normalizedHeight: 0.6, isHighlighted: false },
];

const MOCK_AVERAGE_HOURS_PER_MONTH = 20;

/**
 * F-08 連携前のモック。棒グラフ・平均時間・コストは固定値ベースで price からコストのみ算出。
 */
export function createMockUsageFrequencySnapshot(monthlyPriceYen: number): UsageFrequencySnapshot {
  const costPerHourYen = computeCostPerHourYen(monthlyPriceYen, MOCK_AVERAGE_HOURS_PER_MONTH);

  return {
    bars: MOCK_BARS,
    averageHoursPerMonth: MOCK_AVERAGE_HOURS_PER_MONTH,
    costPerHourYen,
    isAccumulating: false,
  };
}
