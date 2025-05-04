import { 
  formatDateToString,
  formatDisplayDate,
  formatMonth,
  getDaysInMonth,
  getCalendarDays,
  parseDate,
  isCurrentMonth
} from '../../utils/date-utils';

describe('date-utils', () => {
  // formatDateToStringのテスト
  describe('formatDateToString', () => {
    it('日付をYYYY-MM-DD形式に変換すること', () => {
      const date = new Date(2023, 0, 15); // 2023-01-15
      expect(formatDateToString(date)).toBe('2023-01-15');
    });

    it('1桁の月と日にはゼロパディングされること', () => {
      const date = new Date(2023, 0, 5); // 2023-01-05
      expect(formatDateToString(date)).toBe('2023-01-05');
    });
  });

  // formatDisplayDateのテスト
  describe('formatDisplayDate', () => {
    it('日付を日本語表示形式（YYYY年MM月DD日）に変換すること', () => {
      const date = new Date(2023, 0, 15); // 2023-01-15
      expect(formatDisplayDate(date)).toBe('2023年01月15日');
    });
  });

  // formatMonthのテスト
  describe('formatMonth', () => {
    it('年月を日本語表示形式（YYYY年MM月）に変換すること', () => {
      const date = new Date(2023, 0, 15); // 2023-01-15
      expect(formatMonth(date)).toBe('2023年01月');
    });
  });

  // getDaysInMonthのテスト
  describe('getDaysInMonth', () => {
    it('指定された年月の全日付を返すこと', () => {
      const days = getDaysInMonth(2023, 2); // 2023年2月
      
      // 2月は28日まで（2023年は閏年ではない）
      expect(days.length).toBe(28);
      
      // 最初の日は2023-02-01
      expect(formatDateToString(days[0])).toBe('2023-02-01');
      
      // 最後の日は2023-02-28
      expect(formatDateToString(days[27])).toBe('2023-02-28');
    });

    it('閏年の2月は29日を含むこと', () => {
      const days = getDaysInMonth(2024, 2); // 2024年2月（閏年）
      
      // 閏年の2月は29日まで
      expect(days.length).toBe(29);
      
      // 最後の日は2024-02-29
      expect(formatDateToString(days[28])).toBe('2024-02-29');
    });
  });

  // getCalendarDaysのテスト
  describe('getCalendarDays', () => {
    it('前月と次月の日付を含むカレンダー表示用の日付配列を返すこと', () => {
      const days = getCalendarDays(2023, 1); // 2023年1月
      
      // カレンダー日付の配列をチェック
      expect(days.length).toBeGreaterThan(28); // 月の日数より多い（前月と次月の日付を含む）
      
      // 1月の最初の日と最後の日が含まれていることを確認
      const hasJan1 = days.some(d => formatDateToString(d) === '2023-01-01');
      const hasJan31 = days.some(d => formatDateToString(d) === '2023-01-31');
      expect(hasJan1).toBe(true);
      expect(hasJan31).toBe(true);
      
      // 前月または次月の日付が含まれていることを確認
      const hasPrevOrNextMonth = days.some(d => !isCurrentMonth(d, new Date(2023, 0, 1)));
      expect(hasPrevOrNextMonth).toBe(true);
    });
  });

  // parseDateのテスト
  describe('parseDate', () => {
    it('ISO形式（YYYY-MM-DD）の文字列から日付オブジェクトを作成すること', () => {
      const dateStr = '2023-01-15';
      const date = parseDate(dateStr);
      
      expect(date).not.toBeNull();
      expect(formatDateToString(date!)).toBe(dateStr);
    });

    it('日本語形式（YYYY年MM月DD日）の文字列から日付オブジェクトを作成すること', () => {
      const dateStr = '2023年01月15日';
      const date = parseDate(dateStr);
      
      expect(date).not.toBeNull();
      expect(formatDisplayDate(date!)).toBe(dateStr);
    });

    it('無効な形式の文字列の場合はnullを返すこと', () => {
      expect(parseDate('invalid-date')).toBeNull();
      expect(parseDate('')).toBeNull();
    });
  });

  // isCurrentMonthのテスト
  describe('isCurrentMonth', () => {
    it('同じ月の日付の場合はtrueを返すこと', () => {
      const date1 = new Date(2023, 0, 1); // 2023-01-01
      const date2 = new Date(2023, 0, 31); // 2023-01-31
      
      expect(isCurrentMonth(date1, date2)).toBe(true);
    });

    it('異なる月の日付の場合はfalseを返すこと', () => {
      const date1 = new Date(2023, 0, 31); // 2023-01-31
      const date2 = new Date(2023, 1, 1); // 2023-02-01
      
      expect(isCurrentMonth(date1, date2)).toBe(false);
    });
  });
}); 