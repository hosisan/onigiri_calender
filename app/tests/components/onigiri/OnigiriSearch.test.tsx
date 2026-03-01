import { screen, fireEvent } from '@testing-library/react';
import { OnigiriSearch } from '../../../components/onigiri/onigiri-search';
import { render } from '../../utils/test-utils';
import { Onigiri } from '../../../models/Onigiri';

// テスト用のモック関数
const mockOnSearch = jest.fn();
const mockOnSelectOnigiri = jest.fn();

// テスト用のダミー検索結果
const mockSearchResults: Onigiri[] = [
  {
    id: 'test-id-1',
    date: '2023-01-15',
    name: '鮭おにぎり',
    storeName: 'ファミリーマート',
    price: 150,
    imageUrl: '/images/onigiri-sample-1.jpg',
    rating: 4,
    memo: '朝食に食べました。',
    createdAt: '2023-01-15T08:30:00Z',
    updatedAt: '2023-01-15T08:30:00Z'
  },
  {
    id: 'test-id-2',
    date: '2023-01-20',
    name: 'ツナマヨおにぎり',
    storeName: 'セブンイレブン',
    price: 160,
    rating: 5,
    createdAt: '2023-01-20T12:00:00Z',
    updatedAt: '2023-01-20T12:00:00Z'
  }
];

describe('OnigiriSearch', () => {
  beforeEach(() => {
    mockOnSearch.mockClear();
    mockOnSelectOnigiri.mockClear();
  });

  it('検索フォームが正しくレンダリングされること', () => {
    render(
      <OnigiriSearch
        onSearch={mockOnSearch}
        onSelectOnigiri={mockOnSelectOnigiri}
        searchResults={[]}
      />
    );

    expect(screen.getByLabelText('おにぎり名')).toBeInTheDocument();
    expect(screen.getByLabelText('店舗名')).toBeInTheDocument();
    expect(screen.getByLabelText('最低評価')).toBeInTheDocument();
    expect(screen.getByLabelText('最低価格 (円)')).toBeInTheDocument();
    expect(screen.getByLabelText('最高価格 (円)')).toBeInTheDocument();
    expect(screen.getByText('検索')).toBeInTheDocument();
    expect(screen.getByText('リセット')).toBeInTheDocument();
  });

  it('検索ボタンクリックでonSearchが呼ばれること', () => {
    render(
      <OnigiriSearch
        onSearch={mockOnSearch}
        onSelectOnigiri={mockOnSelectOnigiri}
        searchResults={[]}
      />
    );

    // おにぎり名を入力
    fireEvent.change(screen.getByLabelText('おにぎり名'), {
      target: { value: '鮭', name: 'name' }
    });

    // 検索ボタンをクリック
    fireEvent.click(screen.getByText('検索'));

    expect(mockOnSearch).toHaveBeenCalledWith(
      expect.objectContaining({ name: '鮭' })
    );
  });

  it('リセットボタンクリックで入力がクリアされること', () => {
    render(
      <OnigiriSearch
        onSearch={mockOnSearch}
        onSelectOnigiri={mockOnSelectOnigiri}
        searchResults={[]}
      />
    );

    // おにぎり名を入力
    fireEvent.change(screen.getByLabelText('おにぎり名'), {
      target: { value: '鮭', name: 'name' }
    });

    // リセットボタンをクリック
    fireEvent.click(screen.getByText('リセット'));

    // 空のパラメータでonSearchが呼ばれる
    expect(mockOnSearch).toHaveBeenCalledWith({});
  });

  it('検索結果が表示されること', () => {
    render(
      <OnigiriSearch
        onSearch={mockOnSearch}
        onSelectOnigiri={mockOnSelectOnigiri}
        searchResults={mockSearchResults}
      />
    );

    expect(screen.getByText('検索結果: 2件')).toBeInTheDocument();
    expect(screen.getByText('鮭おにぎり')).toBeInTheDocument();
    expect(screen.getByText('ツナマヨおにぎり')).toBeInTheDocument();
  });

  it('検索結果クリックでonSelectOnigiriが呼ばれること', () => {
    render(
      <OnigiriSearch
        onSearch={mockOnSearch}
        onSelectOnigiri={mockOnSelectOnigiri}
        searchResults={mockSearchResults}
      />
    );

    // 最初の結果をクリック
    fireEvent.click(screen.getByText('鮭おにぎり'));

    expect(mockOnSelectOnigiri).toHaveBeenCalledWith(mockSearchResults[0]);
  });

  it('検索結果が0件の場合メッセージが表示されること', () => {
    render(
      <OnigiriSearch
        onSearch={mockOnSearch}
        onSelectOnigiri={mockOnSelectOnigiri}
        searchResults={[]}
      />
    );

    expect(screen.getByText('おにぎりが見つかりませんでした')).toBeInTheDocument();
    expect(screen.getByText('検索条件を変更して再度お試しください')).toBeInTheDocument();
  });

  it('ラベルにtext-foregroundクラスが適用されていること', () => {
    render(
      <OnigiriSearch
        onSearch={mockOnSearch}
        onSelectOnigiri={mockOnSelectOnigiri}
        searchResults={[]}
      />
    );

    const label = screen.getByText('おにぎり名');
    expect(label).toHaveClass('text-foreground');
  });
});
