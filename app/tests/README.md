# おにぎりカレンダー テスト環境

このプロジェクトでは、Jest と React Testing Library を使用してユニットテストを実装しています。

## テスト実行方法

以下のコマンドでテストを実行できます：

```bash
# すべてのテストを実行
npm test

# ウォッチモードでテストを実行（ファイル変更時に自動で再実行）
npm run test:watch

# カバレッジレポートを生成
npm run test:coverage
```

## ディレクトリ構造

```
app/
  ├── components/      # コンポーネント実装
  ├── models/          # データモデル
  ├── tests/           # テスト関連ファイル
  │   ├── components/  # コンポーネントのテスト
  │   ├── utils/       # ユーティリティのテスト
  │   ├── setupTests.ts    # テスト環境のセットアップ
  │   └── fileMock.js      # ファイルモック
  └── utils/           # ユーティリティ関数
```

## テスト作成ガイドライン

### 基本的なテスト方針

1. **コンポーネントテスト**:
   - レンダリングが正しく行われるか
   - ユーザーインタラクション（クリックなど）が期待通りに動作するか
   - 条件付きレンダリングが正しく行われるか

2. **ユーティリティ関数テスト**:
   - 入力に対して期待される出力が返されるか
   - エッジケース（境界値）の処理が正しいか
   - エラーハンドリングが適切か

### テストファイル命名規則

- テストファイルは対象ファイルと同じ名前に `.test.ts` または `.test.tsx` を付けます
- 例: `CalendarGrid.tsx` → `CalendarGrid.test.tsx`

### テスト作成例

```tsx
// コンポーネントのテスト例
import { screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../../components/MyComponent';
import { render } from '../utils/test-utils';

describe('MyComponent', () => {
  it('正しくレンダリングされること', () => {
    render(<MyComponent />);
    expect(screen.getByText('表示テキスト')).toBeInTheDocument();
  });

  it('ボタンクリック時にイベントハンドラが呼ばれること', () => {
    const mockHandler = jest.fn();
    render(<MyComponent onClick={mockHandler} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockHandler).toHaveBeenCalled();
  });
});
```

## モック

現在、以下のモックを使用しています：

- `fileMock.js`: 画像などのファイルをモック
- Next.js の Router 関連機能
- `window.matchMedia` API

必要に応じて、さらに以下のようなモックを追加できます：

- API呼び出し
- サードパーティのライブラリ
- ブラウザAPI 