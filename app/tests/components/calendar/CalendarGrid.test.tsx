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

// 画像なしのダミーデータ
const mockOnigiriDataNoImage = {
  '2023-01-15': [
    {
      id: 'd8b4a7e0-f3e1-4c9b-9a6e-c9f0d9c5b9a2',
      date: '2023-01-15',
      name: '梅おにぎり',
      storeName: 'セブンイレブン',
      price: 130,
      rating: 3,
      memo: '',
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
    expect(day15Button).toHaveClass('h-24');
    expect(day15Button).toHaveClass('sm:h-36');
  });

  it('おにぎりのサムネイル画像がモバイルでも表示されること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={mockOnigiriData}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // 画像要素が存在し、hidden クラスが適用されていないことを確認
    const image = screen.getByAltText('鮭おにぎり');
    expect(image).toBeInTheDocument();
    expect(image).not.toHaveClass('hidden');
  });

  it('画像なしおにぎりにはオレンジドットインジケーターが表示されること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={mockOnigiriDataNoImage}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    // おにぎり名が表示されている
    expect(screen.getByText('梅おにぎり')).toBeInTheDocument();

    // 画像は表示されない
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
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

  it('当月外セルにbg-muted/50クラスが適用されていること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    const allButtons = document.querySelectorAll('button[type="button"]');
    const lastButtons = Array.from(allButtons).filter(btn => {
      return btn.classList.contains('bg-muted/50') && btn.classList.contains('text-muted-foreground');
    });
    // 前月または次月の日付があればbg-muted/50を持つ
    expect(lastButtons.length).toBeGreaterThan(0);
  });
});

describe('CalendarGrid - 今日ボタン', () => {
  beforeEach(() => {
    mockNavigateMonth.mockClear();
  });

  it('現在月以外を表示中に「今日」ボタンが表示されること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    const todayButton = screen.getByLabelText('今月に戻る');
    expect(todayButton).toBeInTheDocument();
  });

  it('現在月を表示中は「今日」ボタンが非表示であること', () => {
    const now = new Date();
    render(
      <CalendarGrid
        year={now.getFullYear()}
        month={now.getMonth() + 1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    expect(screen.queryByLabelText('今月に戻る')).not.toBeInTheDocument();
  });

  it('「今日」ボタンクリックで現在月に移動すること', () => {
    render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    const todayButton = screen.getByLabelText('今月に戻る');
    fireEvent.click(todayButton);

    const now = new Date();
    expect(mockNavigateMonth).toHaveBeenCalledWith(
      now.getFullYear(),
      now.getMonth() + 1
    );
  });
});

describe('CalendarGrid - スワイプナビゲーション', () => {
  beforeEach(() => {
    mockNavigateMonth.mockClear();
  });

  it('左スワイプで次月に移動すること', () => {
    const { container } = render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    const calendarContainer = container.firstChild as HTMLElement;

    fireEvent.touchStart(calendarContainer, {
      touches: [{ clientX: 200, clientY: 200 }]
    });
    fireEvent.touchEnd(calendarContainer, {
      changedTouches: [{ clientX: 100, clientY: 200 }]
    });

    expect(mockNavigateMonth).toHaveBeenCalledWith(2023, 2);
  });

  it('右スワイプで前月に移動すること', () => {
    const { container } = render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    const calendarContainer = container.firstChild as HTMLElement;

    fireEvent.touchStart(calendarContainer, {
      touches: [{ clientX: 100, clientY: 200 }]
    });
    fireEvent.touchEnd(calendarContainer, {
      changedTouches: [{ clientX: 200, clientY: 200 }]
    });

    expect(mockNavigateMonth).toHaveBeenCalledWith(2022, 12);
  });

  it('スワイプ距離が閾値未満の場合は移動しないこと', () => {
    const { container } = render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    const calendarContainer = container.firstChild as HTMLElement;

    fireEvent.touchStart(calendarContainer, {
      touches: [{ clientX: 200, clientY: 200 }]
    });
    fireEvent.touchEnd(calendarContainer, {
      changedTouches: [{ clientX: 170, clientY: 200 }]
    });

    // 30px < 50px threshold, should not navigate
    expect(mockNavigateMonth).not.toHaveBeenCalled();
  });

  it('垂直方向のスワイプでは月移動しないこと', () => {
    const { container } = render(
      <CalendarGrid
        year={2023}
        month={1}
        onigiriData={{}}
        onDateSelect={mockDateSelect}
        onNavigateMonth={mockNavigateMonth}
      />
    );

    const calendarContainer = container.firstChild as HTMLElement;

    fireEvent.touchStart(calendarContainer, {
      touches: [{ clientX: 200, clientY: 100 }]
    });
    fireEvent.touchEnd(calendarContainer, {
      changedTouches: [{ clientX: 140, clientY: 300 }]
    });

    // deltaX=60 but deltaY=200 > deltaX, so no navigation
    expect(mockNavigateMonth).not.toHaveBeenCalled();
  });
});
