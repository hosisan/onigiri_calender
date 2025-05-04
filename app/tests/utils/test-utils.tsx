// テスト用のユーティリティ関数
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

// カスタムレンダリングオプションのインターフェース
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // 将来的に必要なオプションを追加可能
}

/**
 * テスト用のカスタムレンダー関数
 * 将来的にグローバルなプロバイダーが必要になった場合は、
 * ここでラップすることができます
 */
function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, { ...options });
}

// Testing Libraryのすべてのユーティリティをエクスポート
export * from '@testing-library/react';

// オーバーライドしたレンダー関数をエクスポート
export { customRender as render }; 