import { screen, fireEvent } from '@testing-library/react';
import { OnigiriDialog } from '../../../components/onigiri/onigiri-dialog';
import { render } from '../../utils/test-utils';
import { Onigiri } from '../../../models/Onigiri';
import { Dialog } from '../../../components/ui/dialog';

// Supabaseのモック
jest.mock('../../../utils/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/image.jpg' } })),
        remove: jest.fn(),
        list: jest.fn(),
      })),
    },
  },
}));

// テスト用のモック関数
const mockOnClose = jest.fn();
const mockOnSave = jest.fn();

// OnigiriDialogはDialogTitle等を使うため、Radix DialogコンテキストでラップするHelper
const renderWithDialog = (ui: React.ReactElement) => {
  return render(<Dialog open={true}>{ui}</Dialog>);
};

// テスト用の日付
const testDate = new Date(2023, 0, 15); // 2023年1月15日

// テスト用のおにぎりデータ
const mockOnigiri: Onigiri = {
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
};

describe('OnigiriDialog - 表示モード', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('おにぎり情報が正しく表示されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onigiri={mockOnigiri}
        onSave={mockOnSave}
      />
    );

    expect(screen.getAllByText('鮭おにぎり', { exact: false }).length).toBeGreaterThan(0);
    expect(screen.getAllByText('ファミリーマート').length).toBeGreaterThan(0);
    expect(screen.getByText('150円')).toBeInTheDocument();
  });

  it('編集ボタンクリックで編集モードに切り替わること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onigiri={mockOnigiri}
        onSave={mockOnSave}
      />
    );

    // 編集ボタンをクリック
    fireEvent.click(screen.getByText('編集'));

    // フォームフィールドが表示される
    expect(screen.getByLabelText(/おにぎり名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/店舗名/)).toBeInTheDocument();
  });

  it('閉じるボタンクリックでonCloseが呼ばれること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onigiri={mockOnigiri}
        onSave={mockOnSave}
      />
    );

    fireEvent.click(screen.getByText('閉じる'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('情報カードが表示されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onigiri={mockOnigiri}
        onSave={mockOnSave}
      />
    );

    // 情報カードのラベルが表示されること
    expect(screen.getByText('店舗')).toBeInTheDocument();
    expect(screen.getByText('価格')).toBeInTheDocument();
    expect(screen.getByText('評価')).toBeInTheDocument();
  });

  it('メモが全文表示されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onigiri={mockOnigiri}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('朝食に食べました。')).toBeInTheDocument();
  });
});

describe('OnigiriDialog - 編集モード', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('新規登録時は編集モードで開くこと', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onSave={mockOnSave}
      />
    );

    // フォームフィールドが表示される（編集モード）
    expect(screen.getByLabelText(/おにぎり名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/店舗名/)).toBeInTheDocument();
    expect(screen.getByLabelText(/価格/)).toBeInTheDocument();
  });

  it('フォームセクションが表示されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('基本情報')).toBeInTheDocument();
    expect(screen.getByText('写真')).toBeInTheDocument();
    expect(screen.getByText('メモ')).toBeInTheDocument();
  });

  it('画像アップロードカードのプレースホルダーが表示されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onSave={mockOnSave}
      />
    );

    const placeholders = screen.getAllByText('写真を追加');
    expect(placeholders.length).toBe(2);
  });

  it('必須フィールドが空の場合、保存ボタンが無効化されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onSave={mockOnSave}
      />
    );

    const saveButton = screen.getByText('保存');
    expect(saveButton).toBeDisabled();
  });

  it('価格フィールドに「円」サフィックスが表示されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onSave={mockOnSave}
      />
    );

    // 「円」テキストがフォーム内に表示されることを確認
    const yenSuffix = screen.getByText('円');
    expect(yenSuffix).toBeInTheDocument();
  });

  it('画像URL入力がデフォルトで非表示であること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onSave={mockOnSave}
      />
    );

    // imageUrl入力フィールドが初期状態で表示されていない
    expect(screen.queryByPlaceholderText('https://example.com/image.jpg')).not.toBeInTheDocument();
    // トグルリンクが表示されている
    expect(screen.getAllByText('URLを直接入力する').length).toBeGreaterThan(0);
  });

  it('「URLを直接入力する」クリックでURL入力が表示されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onSave={mockOnSave}
      />
    );

    // トグルリンクをクリック（最初の「URLを直接入力する」）
    const toggleButtons = screen.getAllByText('URLを直接入力する');
    fireEvent.click(toggleButtons[0]);

    // URL入力フィールドが表示される
    expect(screen.getByPlaceholderText('https://example.com/image.jpg')).toBeInTheDocument();
  });

  it('保存ボタンクリックでonSaveが呼ばれること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onSave={mockOnSave}
      />
    );

    // 必須フィールドを入力
    fireEvent.change(screen.getByLabelText(/おにぎり名/), {
      target: { value: '鮭おにぎり', name: 'name' }
    });
    fireEvent.change(screen.getByLabelText(/店舗名/), {
      target: { value: 'ファミリーマート', name: 'storeName' }
    });

    // 保存ボタンをクリック
    fireEvent.click(screen.getByText('保存'));

    expect(mockOnSave).toHaveBeenCalled();
  });

  it('キャンセルで編集内容が破棄されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onigiri={mockOnigiri}
        onSave={mockOnSave}
      />
    );

    // 編集モードに切り替え
    fireEvent.click(screen.getByText('編集'));

    // おにぎり名を変更
    fireEvent.change(screen.getByLabelText(/おにぎり名/), {
      target: { value: '変更されたおにぎり', name: 'name' }
    });

    // キャンセルボタンをクリック
    fireEvent.click(screen.getByText('キャンセル'));

    // 元のおにぎり名が表示される（表示モードに戻る）
    expect(screen.getAllByText('鮭おにぎり', { exact: false }).length).toBeGreaterThan(0);
  });

  it('バリデーションエラーがblur後に表示されること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onSave={mockOnSave}
      />
    );

    const nameInput = screen.getByLabelText(/おにぎり名/);

    // フォーカスしてからblur
    fireEvent.focus(nameInput);
    fireEvent.blur(nameInput);

    // バリデーションメッセージが表示される
    expect(screen.getByText('おにぎり名は必須です')).toBeInTheDocument();
  });
});

describe('OnigiriDialog - アクセシビリティ', () => {
  it('BottomSheetTitleが正しいテキストでレンダリングされること', () => {
    renderWithDialog(
      <OnigiriDialog
        isOpen={true}
        onClose={mockOnClose}
        date={testDate}
        onigiri={mockOnigiri}
        onSave={mockOnSave}
      />
    );

    // Radix DialogTitleとしてタイトルが存在する
    const title = screen.getByText(/2023年01月15日のおにぎり/);
    expect(title).toBeInTheDocument();
  });
});
