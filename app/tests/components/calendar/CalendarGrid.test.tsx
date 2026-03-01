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

describe('CalendarGrid - モバイルレスポンシブ', () => {
  it('日付セルにレスポンシブなクラスが適用されていること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // 15日のボタンを取得
    const day15Button = screen.getByText('15').closest('button');
    expect(day15Button).toHaveClass('h-20');
    expect(day15Button).toHaveClass('sm:h-32');
  });

  it('おにぎりのサムネイル画像にhidden sm:blockが適用されていること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={mockOnigiriData}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // 画像コンテナを取得（imageUrlがある場合）
    const imageContainer = screen.getByAltText('鮭おにぎり').closest('div');
    expect(imageContainer).toHaveClass('hidden');
    expect(imageContainer).toHaveClass('sm:block');
  });
});

describe('CalendarGrid - ダークモード対応', () => {
  it('当月セルにbg-cardクラスが適用されていること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // 15日は当月なのでbg-cardを含む
    const day15Button = screen.getByText('15').closest('button');
    expect(day15Button).toHaveClass('bg-card');
  });

  it('当月外セルにbg-mutedクラスが適用されていること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // 2023年1月のカレンダーでは、前月の12月の日付が表示される
    // カレンダーグリッドの最初のセルを確認（日曜始まりで1月1日が日曜の場合は当月）
    // 1月1日は日曜日なので全て当月。代わりに2月の日付を確認
    // getAllByTextで複数の同じテキストを取得する可能性があるため、特定の日付を使う
    const allButtons = document.querySelectorAll('button[type="button"]');
    // 最後のボタンは次月の日付のはず
    const lastButtons = Array.from(allButtons).filter(btn => {
      return btn.classList.contains('bg-muted') && btn.classList.contains('text-muted-foreground');
    });
    // 前月または次月の日付があればbg-mutedを持つ
    expect(lastButtons.length).toBeGreaterThan(0);
  });
}); 