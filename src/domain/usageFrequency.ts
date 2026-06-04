/**
 * 利用頻度・コスト表示（F-09）のドメイン型と純粋関数。
 *
 * データモデル前提: usage_logs は「その日使ったか」の日単位 ON/OFF（used_date のユニーク）。
 * 利用"時間"は取得できないため、指標は「利用回数（日数）」と「1 回あたりコスト」で表現する。
 * ヒートマップは選択中の 1 か月をカレンダー（日曜始まり）として描画する。
 */

import { formatLocalDate } from './localDate';

const DAYS_IN_WEEK = 7;

export interface UsageHeatmapCell {
  date: Date;
  /** 表示中の月に属する日か（月外はプレースホルダ） */
  inMonth: boolean;
  /** その日に利用記録があるか */
  used: boolean;
  isToday: boolean;
  /** 今日より未来（描画上は不活性にする） */
  isFuture: boolean;
}

/** 1 列 = 1 週間。index 0..6 が日曜〜土曜。 */
export type UsageHeatmapWeek = UsageHeatmapCell[];

export interface MonthUsageView {
  /** 古い週 → 新しい週の順に並んだ週カラム */
  weeks: UsageHeatmapWeek[];
  /** ヘッダー表示用ラベル（例: 2026年6月） */
  monthLabel: string;
  year: number;
  /** 1-12 */
  month: number;
  /** この月の利用回数（日数） */
  usesInMonth: number;
  /** 1 回あたりコスト（円）。0 回なら null */
  costPerUseYen: number | null;
  /** この月に今日が含まれ、かつ今日利用済みか */
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

export function formatMonthLabel(year: number, month: number): string {
  return `${year}年${month}月`;
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
 * 指定年月のカレンダーヒートマップ（週カラム配列）を作る純粋関数。
 * 月初週の前・月末週の後ろは inMonth=false のプレースホルダで埋める。
 */
export function buildMonthHeatmapWeeks(
  usedDateKeys: ReadonlySet<string>,
  year: number,
  month: number,
  today: Date
): UsageHeatmapWeek[] {
  const todayKey = formatLocalDate(today);

  const firstOfMonth = new Date(year, month - 1, 1);
  const gridStart = new Date(firstOfMonth);
  gridStart.setDate(1 - firstOfMonth.getDay());

  const lastOfMonth = new Date(year, month, 0);
  const gridEnd = new Date(lastOfMonth);
  gridEnd.setDate(lastOfMonth.getDate() + (6 - lastOfMonth.getDay()));

  const weeks: UsageHeatmapWeek[] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const week: UsageHeatmapWeek = [];
    for (let d = 0; d < DAYS_IN_WEEK; d++) {
      const key = formatLocalDate(cursor);
      const inMonth = cursor.getMonth() === month - 1;
      week.push({
        date: new Date(cursor),
        inMonth,
        used: inMonth && usedDateKeys.has(key),
        isToday: inMonth && key === todayKey,
        isFuture: key > todayKey,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/**
 * 指定年月の表示用ビューを組み立てる純粋関数（実データ連携でも使える）。
 */
export function buildMonthUsageView(
  usedDateKeys: ReadonlySet<string>,
  monthlyPriceYen: number,
  year: number,
  month: number,
  today: Date = new Date()
): MonthUsageView {
  const usesInMonth = countUsesInMonth(usedDateKeys, year, month);
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;

  return {
    weeks: buildMonthHeatmapWeeks(usedDateKeys, year, month, today),
    monthLabel: formatMonthLabel(year, month),
    year,
    month,
    usesInMonth,
    costPerUseYen: computeCostPerUseYen(monthlyPriceYen, usesInMonth),
    isUsedToday: isCurrentMonth && usedDateKeys.has(formatLocalDate(today)),
    isAccumulating: usedDateKeys.size === 0,
  };
}

/**
 * F-08 連携前のモック。直近 days 日ぶんの利用日を決定的なパターンで生成する。
 */
export function createMockUsedDateKeys(
  today: Date = new Date(),
  days: number = 140
): ReadonlySet<string> {
  const usedDateKeys = new Set<string>();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const seed = (i * 7 + 3) % 11;
    const recentBoost = i < 21 ? 1 : 0;
    if (seed + recentBoost < 5) {
      usedDateKeys.add(formatLocalDate(date));
    }
  }

  return usedDateKeys;
}
