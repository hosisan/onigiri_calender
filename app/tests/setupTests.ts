// テスト環境のセットアップスクリプト
import '@testing-library/jest-dom';

// window.matchMediaのモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // 非推奨だが、古いコードをサポートするために追加
    removeListener: jest.fn(), // 非推奨だが、古いコードをサポートするために追加
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Next.jsのRouter関連のモック
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Next.jsのImageコンポーネントをモック
// コンポーネントではなく通常のimg要素として機能するようにする
jest.mock('next/image', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require('react');
  const nextImage = jest.fn(
    ({ src, alt, width, height, ...props }) => {
      return React.createElement('img', {
        src,
        alt,
        width,
        height,
        ...props,
      });
    }
  );
  return {
    __esModule: true,
    default: nextImage,
  };
}); 