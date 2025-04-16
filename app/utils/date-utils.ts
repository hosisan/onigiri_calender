import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, parse, isValid, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * 日付を YYYY-MM-DD 形式に変換
 */
export function formatDateToString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * 日付を表示用の形式に変換
 */
export function formatDisplayDate(date: Date): string {
  return format(date, 'yyyy年MM月dd日', { locale: ja });
}

/**
 * 月の表示用の形式に変換
 */
export function formatMonth(date: Date): string {
  return format(date, 'yyyy年MM月', { locale: ja });
}

/**
 * 指定された年月の全日付を取得
 */
export function getDaysInMonth(year: number, month: number): Date[] {
  // monthは1-12の範囲で受け取るが、Dateコンストラクタでは0-11が必要
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(startDate);
  
  return eachDayOfInterval({ start: startDate, end: endDate });
}

/**
 * カレンダー表示用の日付配列を取得（前月と次月の日付を含む）
 */
export function getCalendarDays(year: number, month: number): Date[] {
  // monthは1-12の範囲
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(startDate);
  
  // 週の開始日（日曜日）になるように前月の日付を追加
  const startDay = startDate.getDay(); // 0:日曜日, 1:月曜日, ...
  const prevDays: Date[] = [];
  
  for (let i = startDay - 1; i >= 0; i--) {
    const date = new Date(startDate);
    date.setDate(date.getDate() - (i + 1));
    prevDays.push(date);
  }
  
  // 当月の全日付
  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
  
  // 週の終了日（土曜日）になるように次月の日付を追加
  const endDay = endDate.getDay(); // 0:日曜日, 1:月曜日, ...
  const nextDays: Date[] = [];
  
  for (let i = 1; i <= 6 - endDay; i++) {
    const date = new Date(endDate);
    date.setDate(date.getDate() + i);
    nextDays.push(date);
  }
  
  return [...prevDays, ...daysInMonth, ...nextDays];
}

/**
 * 文字列から日付オブジェクトを作成
 */
export function parseDate(dateString: string): Date | null {
  if (!dateString) return null;
  
  // ISO形式（YYYY-MM-DD）からのパース
  if (dateString.includes('-')) {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  }
  
  // 日本語形式（YYYY年MM月DD日）からのパース
  try {
    const date = parse(dateString, 'yyyy年MM月dd日', new Date(), { locale: ja });
    return isValid(date) ? date : null;
  } catch (e) {
    return null;
  }
}

/**
 * 日付が当月かどうかをチェック
 */
export function isCurrentMonth(date: Date, currentDate: Date): boolean {
  return isSameMonth(date, currentDate);
}

/**
 * ナビゲーション用の年月の範囲を取得（2020年から現在まで）
 */
export function getYearMonthRange(): { year: number; month: number }[] {
  const result: { year: number; month: number }[] = [];
  const startYear = 2020;
  const startMonth = 1;
  
  const now = new Date();
  const endYear = now.getFullYear();
  const endMonth = now.getMonth() + 1;
  
  for (let year = startYear; year <= endYear; year++) {
    const monthStart = year === startYear ? startMonth : 1;
    const monthEnd = year === endYear ? endMonth : 12;
    
    for (let month = monthStart; month <= monthEnd; month++) {
      result.push({ year, month });
    }
  }
  
  return result;
} 