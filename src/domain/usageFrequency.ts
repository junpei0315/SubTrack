/**
 * 利用頻度・コスト表示（F-09）のドメイン型と純粋関数。
 *
 * データモデル前提: usage_logs は「その日使ったか」の日単位 ON/OFF（used_date のユニーク）。
 * 利用"時間"は取得できないため、指標は「利用回数（日数）」と「1 回あたりコスト」で表現する。
 * ヒートマップは GitHub 風に、複数月ぶんの連続した日を週カラム（日曜始まり）で描画する。
 */

import { formatLocalDate } from './localDate';

const DAYS_IN_WEEK = 7;
export const DEFAULT_MONTHS_TO_SHOW = 3;

export interface UsageHeatmapCell {
  date: Date;
  /** 表示範囲に含まれる日か（範囲外はプレースホルダ） */
  inRange: boolean;
  /** その日に利用記録があるか */
  used: boolean;
  isToday: boolean;
  /** 今日より未来（描画上は不活性にする） */
  isFuture: boolean;
}

/** 1 列 = 1 週間。index 0..6 が月曜〜日曜。 */
export type UsageHeatmapWeek = UsageHeatmapCell[];

export interface HeatmapMonthLabel {
  /** ラベルを表示する週カラムの index */
  weekIndex: number;
  /** 例: 6月 */
  label: string;
}

export interface RangeUsageView {
  /** 古い週 → 新しい週の順に並んだ週カラム */
  weeks: UsageHeatmapWeek[];
  /** 週カラム上部に出す月ラベル */
  monthLabels: HeatmapMonthLabel[];
  /** ヘッダー表示用ラベル（例: 2026年4月 〜 6月） */
  rangeLabel: string;
  /** 表示範囲の末尾の月（ナビ基準）。1-12 */
  anchorYear: number;
  anchorMonth: number;
  /** 末尾の月が今月か（次の月へ進めないようにする判定に使う） */
  isAnchorCurrentMonth: boolean;
  /** 「今月」の利用回数（日数） */
  usesThisMonth: number;
  /** 1 回あたりコスト（円）。今月 0 回なら null */
  costPerUseYen: number | null;
  /** 今日すでに利用記録があるか */
  isUsedToday: boolean;
  /** 利用記録がまだ存在しない */
  isAccumulating: boolean;
}

/**
 * 1 回あたりのコスト = 月額 ÷ 利用回数。0 回・不正な金額のときは null。
 */
export function computeCostPerUseYen(
  monthlyPriceYen: number,
  usesInMonth: number
): number | null {
  if (usesInMonth <= 0 || monthlyPriceYen < 0) {
    return null;
  }
  return Math.round(monthlyPriceYen / usesInMonth);
}

export function formatUseCount(count: number): string {
  return `${count} 回`;
}

export function formatCostPerUseYen(yen: number): string {
  return `¥${yen.toLocaleString('ja-JP')}`;
}

/** 指定年月（month は 1-12）の利用回数を数える。 */
export function countUsesInMonth(
  usedDateKeys: ReadonlySet<string>,
  year: number,
  month: number
): number {
  const prefix = `${year}-${String(month).padStart(2, '0')}-`;
  let count = 0;
  for (const key of usedDateKeys) {
    if (key.startsWith(prefix)) {
      count += 1;
    }
  }
  return count;
}

/**
 * [rangeStart, rangeEnd] を覆う連続ヒートマップ（週カラム配列）を作る純粋関数。
 * 範囲外（グリッド端の埋め）は inRange=false のプレースホルダにする。
 */
export function buildRangeHeatmapWeeks(
  usedDateKeys: ReadonlySet<string>,
  rangeStart: Date,
  rangeEnd: Date,
  today: Date
): UsageHeatmapWeek[] {
  const todayKey = formatLocalDate(today);
  const startKey = formatLocalDate(rangeStart);
  const endKey = formatLocalDate(rangeEnd);

  // 月曜始まり: Mon=0 ... Sun=6
  const mondayIndex = (date: Date) => (date.getDay() + 6) % 7;

  const gridStart = new Date(rangeStart);
  gridStart.setDate(rangeStart.getDate() - mondayIndex(rangeStart));

  const gridEnd = new Date(rangeEnd);
  gridEnd.setDate(rangeEnd.getDate() + (6 - mondayIndex(rangeEnd)));

  const weeks: UsageHeatmapWeek[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const week: UsageHeatmapWeek = [];
    for (let d = 0; d < DAYS_IN_WEEK; d++) {
      const key = formatLocalDate(cursor);
      const inRange = key >= startKey && key <= endKey;
      week.push({
        date: new Date(cursor),
        inRange,
        used: inRange && usedDateKeys.has(key),
        isToday: key === todayKey,
        isFuture: key > todayKey,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function buildMonthLabels(weeks: UsageHeatmapWeek[]): HeatmapMonthLabel[] {
  const labels: HeatmapMonthLabel[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstInRange = week.find((cell) => cell.inRange);
    if (!firstInRange) {
      return;
    }
    const month = firstInRange.date.getMonth() + 1;
    if (month !== lastMonth) {
      labels.push({ weekIndex, label: `${month}月` });
      lastMonth = month;
    }
  });

  return labels;
}

/**
 * 末尾の月（anchor）から monthsToShow ヶ月ぶんを表示する範囲ビューを組み立てる純粋関数。
 * 指標（利用回数・コスト）は常に「今日の属する月」を集計する。
 */
export function buildRangeUsageView(
  usedDateKeys: ReadonlySet<string>,
  monthlyPriceYen: number,
  anchorYear: number,
  anchorMonth: number,
  monthsToShow: number = DEFAULT_MONTHS_TO_SHOW,
  today: Date = new Date()
): RangeUsageView {
  const rangeStart = new Date(anchorYear, anchorMonth - monthsToShow, 1);
  const rangeEnd = new Date(anchorYear, anchorMonth, 0);

  const weeks = buildRangeHeatmapWeeks(usedDateKeys, rangeStart, rangeEnd, today);

  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const usesThisMonth = countUsesInMonth(usedDateKeys, todayYear, todayMonth);

  const rangeLabel =
    rangeStart.getFullYear() === rangeEnd.getFullYear()
      ? `${rangeStart.getFullYear()}年${rangeStart.getMonth() + 1}月 〜 ${rangeEnd.getMonth() + 1}月`
      : `${rangeStart.getFullYear()}年${rangeStart.getMonth() + 1}月 〜 ${rangeEnd.getFullYear()}年${rangeEnd.getMonth() + 1}月`;

  return {
    weeks,
    monthLabels: buildMonthLabels(weeks),
    rangeLabel,
    anchorYear,
    anchorMonth,
    isAnchorCurrentMonth: anchorYear === todayYear && anchorMonth === todayMonth,
    usesThisMonth,
    costPerUseYen: computeCostPerUseYen(monthlyPriceYen, usesThisMonth),
    isUsedToday: usedDateKeys.has(formatLocalDate(today)),
    isAccumulating: usedDateKeys.size === 0,
  };
}
