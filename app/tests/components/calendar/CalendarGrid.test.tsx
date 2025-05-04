import { screen, fireEvent } from '@testing-library/react';
import { CalendarGrid } from '../../../components/calendar/calendar-grid';
import { render } from '../../utils/test-utils';
import { formatDateToString } from '../../../utils/date-utils';

// テスト用のダミーデータ
const mockOnigiriData = {
  '2023-01-15': [
    {
      id: 'd8b4a7e0-f3e1-4c9b-9a6e-c9f0d9c5b9a1',
      date: '2023-01-15',
      name: '鮭おにぎり',
      storeName: 'ファミリーマート',
      price: 150,
      imageUrl: '/images/onigiri-sample-1.jpg',
      rating: 4,
      memo: '朝食に食べました。塩加減が絶妙でした。',
      createdAt: '2023-01-15T08:30:00Z',
      updatedAt: '2023-01-15T08:30:00Z'
    }
  ]
};

// テスト用のモック関数
const mockDateSelect = jest.fn();
const mockNavigateMonth = jest.fn();

describe('CalendarGrid', () => {
  beforeEach(() => {
    // 各テスト前にモック関数をリセット
    mockDateSelect.mockClear();
    mockNavigateMonth.mockClear();
  });

  it('カレンダーグリッドが正しくレンダリングされること', () => {
    // 2023年1月のカレンダーをレンダリング
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={mockOnigiriData}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // 月表示が正しいか確認
    expect(screen.getByText('2023年01月')).toBeInTheDocument();

    // 曜日ヘッダーが表示されていることを確認
    expect(screen.getByText('日')).toBeInTheDocument();
    expect(screen.getByText('月')).toBeInTheDocument();
    expect(screen.getByText('火')).toBeInTheDocument();
    expect(screen.getByText('水')).toBeInTheDocument();
    expect(screen.getByText('木')).toBeInTheDocument();
    expect(screen.getByText('金')).toBeInTheDocument();
    expect(screen.getByText('土')).toBeInTheDocument();

    // 1月の日付が表示されていることを確認（例：15日）
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('日付をクリックするとonDateSelect関数が呼ばれること', () => {
    // 2023年1月のカレンダーをレンダリング
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={mockOnigiriData}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // 15日をクリック
    const day15Button = screen.getByText('15').closest('button');
    if (day15Button) {
      fireEvent.click(day15Button);
    }

    // onDateSelect関数が呼ばれたことを確認
    expect(mockDateSelect).toHaveBeenCalled();
    
    // 引数が正しい日付（2023-01-15）であることを確認
    const calledDate = mockDateSelect.mock.calls[0][0];
    expect(formatDateToString(calledDate)).toBe('2023-01-15');
  });

  it('前月ボタンをクリックするとonNavigateMonth関数が呼ばれること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={mockOnigiriData}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // 前月ボタンをクリック
    const prevButton = screen.getByLabelText('前月へ');
    fireEvent.click(prevButton);

    // onNavigateMonth関数が正しい引数（2022年12月）で呼ばれたことを確認
    expect(mockNavigateMonth).toHaveBeenCalledWith(2022, 12);
  });

  it('次月ボタンをクリックするとonNavigateMonth関数が呼ばれること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={mockOnigiriData}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // 次月ボタンをクリック
    const nextButton = screen.getByLabelText('次月へ');
    fireEvent.click(nextButton);

    // onNavigateMonth関数が正しい引数（2023年2月）で呼ばれたことを確認
    expect(mockNavigateMonth).toHaveBeenCalledWith(2023, 2);
  });

  it('おにぎりデータがある日付には表示されること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={mockOnigiriData}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // おにぎり名が表示されていることを確認
    expect(screen.getByText('鮭おにぎり')).toBeInTheDocument();
  });
}); 