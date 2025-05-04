// Jest configuration for Next.js project
module.exports = {
  // テスト環境としてjsdomを使用
  testEnvironment: 'jsdom',
  
  // テストファイルのパターン設定
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  
  // テスト対象から除外するディレクトリ
  testPathIgnorePatterns: ['/node_modules/', '/.next/'],
  
  // モジュール解決の設定
  moduleNameMapper: {
    // CSS、画像などのアセットをモック化
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/app/tests/fileMock.js',
  },
  
  // テスト実行前の処理
  setupFilesAfterEnv: ['<rootDir>/app/tests/setupTests.ts'],
  
  // トランスパイルの設定
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // モジュールファイルの拡張子設定
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // カバレッジの設定
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    '!app/**/*.d.ts',
    '!app/tests/**',
    '!**/node_modules/**',
  ],
  
  // テスト環境のグローバル変数
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
}; 