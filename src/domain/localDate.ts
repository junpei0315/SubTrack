/**
 * Format a Date as YYYY-MM-DD in local timezone (not UTC).
 */
export function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string as a Date in local timezone (not UTC).
 * Supabase の DATE 型は文字列で返るため、UTC 解釈によるズレを避ける用途で使う。
 */
export function parseLocalDate(value: string): Date {
  const [yearStr, monthStr, dayStr] = value.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  return new Date(year, month - 1, day);
}
