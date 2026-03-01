# おにぎりカレンダー 仕様書

## 1. アプリケーション概要

おにぎりカレンダーは、おにぎりの購入記録をカレンダー形式で管理するWebアプリケーションである。ユーザーはおにぎりの名前、店舗名、価格、評価、写真、メモを登録し、カレンダー上で視覚的に確認できる。また、条件を指定しておにぎりを検索する機能も備える。

## 2. 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | Next.js (App Router) | 15.3.0 |
| UIライブラリ | React | 19.0.0 |
| 言語 | TypeScript | 5 |
| データベース | Supabase (PostgreSQL) | supabase-js 2.49.4 |
| スタイリング | Tailwind CSS | 4 |
| UIコンポーネント | shadcn/ui + Radix UI | - |
| アイコン | Lucide React | 0.488.0 |
| 日付操作 | date-fns | 4.1.0 |
| 画像リサイズ | browser-image-resizer | 2.4.1 |
| テスト | Jest + React Testing Library | Jest 29.7.0 |

## 3. 画面構成

アプリケーションは単一ページ（SPA）で構成され、ヘッダーのタブで「カレンダー」と「検索」のビューを切り替える。

### 3.1 共通ヘッダー

- アプリケーションタイトル「おにぎりカレンダー」を中央に表示
- 「カレンダー」「検索」の2つのタブボタンで表示モードを切り替える
- アクティブなタブはオレンジ色（`bg-orange-500`）で表示

### 3.2 カレンダー画面

月単位のカレンダーをグリッド表示する。

- **月ナビゲーション**: 左右の矢印ボタンで前月・次月に移動
- **曜日ヘッダー**: 日〜土の7列。日曜は赤色、土曜は青色で表示。モバイルでは小さいフォントサイズ（`text-xs sm:text-base`）
- **日付セル**: 7列のグリッドで各日を表示（モバイル: 高さ80px / デスクトップ: 高さ128px）
  - 当月の日付は `bg-card` 背景、前月・次月の日付は `bg-muted` 背景（ダークモード自動対応）
  - おにぎりが登録されている日にはオレンジ色のインジケーターを表示
  - 登録されたおにぎりの名前を最大1件表示。サムネイル画像はデスクトップのみ表示（モバイルでは非表示）
  - 日付セルをクリックすると、おにぎり詳細/登録ダイアログが開く

### 3.3 検索画面

おにぎりを条件指定で検索する。

**検索条件フォーム:**

| フィールド | 入力タイプ | 説明 |
|-----------|----------|------|
| おにぎり名 | テキスト | 部分一致検索 |
| 店舗名 | テキスト | 部分一致検索 |
| 最低評価 | セレクト (1〜5) | 指定した評価以上 |
| 最低価格 | 数値 | 指定した価格以上 |
| 最高価格 | 数値 | 指定した価格以下 |

- 「検索」ボタンで検索実行、「リセット」ボタンで条件をクリアし全件表示
- 検索条件が空の場合は全件取得

**検索結果リスト:**

- 件数を「検索結果: N件」と表示
- 各結果にはサムネイル画像、おにぎり名、店舗名、価格、星評価、メモ（先頭部分）、日付を表示
- 結果をクリックすると、カレンダー画面に切り替わり該当月に移動し、詳細ダイアログが開く

### 3.4 おにぎり詳細/登録ダイアログ

Radix UI Dialog（`DialogContent`）によるモーダルとして表示される。ESCキーまたはオーバーレイクリックで閉じることができ、フォーカストラップによるアクセシビリティに対応。`DialogTitle` / `DialogDescription`（スクリーンリーダー向け）を含む。おにぎりの有無により表示内容が変わる。

**表示モード（おにぎりが登録済みの場合）:**

- ヘッダーに「{日付}のおにぎり」とおにぎり名・店舗名を表示
- おにぎり名、店舗名、価格（円）、評価（星表示）を表示
- おにぎりの写真、食べた時の写真を表示（存在する場合）
- メモを表示（存在する場合、最大3行まで）
- フッターに「閉じる」「編集」ボタン

**編集モード（新規登録、または既存おにぎりの編集）:**

- ヘッダーに「{日付}のおにぎりを登録」または「{日付}のおにぎりを編集」と表示

| フィールド | 入力タイプ | 必須 | 説明 |
|-----------|----------|------|------|
| おにぎり名 | テキスト | はい | おにぎりの名前 |
| 店舗名 | テキスト | はい | 購入した店舗名 |
| 価格 | 数値（入力欄右端に「円」サフィックス表示） | はい | 価格（0以上） |
| 評価 | 星クリック (1〜5) | いいえ | デフォルト3。星をクリックして設定 |
| おにぎりの写真 | ファイル選択。「URLを直接入力する」トグルでURL入力欄を展開可能 | いいえ | 画像アップロードまたは直接URL入力 |
| 食べた時の写真 | ファイル選択。「URLを直接入力する」トグルでURL入力欄を展開可能 | いいえ | 画像アップロードまたは直接URL入力 |
| メモ | テキストエリア | いいえ | 自由記述 |

- 必須フィールド（おにぎり名、店舗名）が未入力の場合、「保存」ボタンは無効化
- フッターに「キャンセル」（既存おにぎりの編集時のみ）、「保存」ボタン

## 4. データモデル

### 4.1 Onigiri

```typescript
interface Onigiri {
  id: string;          // UUID（データベース自動生成）
  date: string;        // 登録日（YYYY-MM-DD形式）
  name: string;        // おにぎり名
  storeName: string;   // 店舗名
  price: number;       // 価格（円）
  imageUrl?: string;   // おにぎりの写真URL
  eatImageUrl?: string; // 食べた時の写真URL
  rating: number;      // 評価（1〜5）
  memo?: string;       // メモ
  createdAt: string;   // 作成日時（ISO 8601）
  updatedAt: string;   // 更新日時（ISO 8601）
}
```

### 4.2 派生型

| 型名 | 説明 |
|------|------|
| `CreateOnigiriInput` | `Onigiri` から `id`, `createdAt`, `updatedAt` を除外 |
| `UpdateOnigiriInput` | `CreateOnigiriInput` のすべてのフィールドを省略可能にしたもの |
| `OnigiriSearchParams` | 検索パラメータ（name, storeName, minPrice, maxPrice, minRating, maxRating, dateFrom, dateTo） |

## 5. データベース設計

### 5.1 onigiri テーブル

| カラム名 | データ型 | 制約 | 説明 |
|---------|---------|------|------|
| id | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | ユニークID |
| date | DATE | NOT NULL | 登録日 |
| name | TEXT | NOT NULL | おにぎり名 |
| storeName | TEXT | NOT NULL | 店舗名 |
| price | INT4 | NOT NULL | 価格 |
| imageUrl | TEXT | - | おにぎりの写真URL |
| eatImageUrl | TEXT | - | 食べた時の写真URL |
| rating | INT4 | NOT NULL | 評価（1〜5） |
| memo | TEXT | - | メモ |
| createdAt | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 作成日時 |
| updatedAt | TIMESTAMPTZ | NOT NULL, DEFAULT now() | 更新日時 |

### 5.2 インデックス

| インデックス名 | カラム |
|--------------|-------|
| onigiri_date_idx | date |
| onigiri_name_idx | name |
| onigiri_storename_idx | storeName |

### 5.3 トリガー

- `onigiri_updated_at_trigger`: UPDATE時に `updatedAt` を自動的に現在時刻に更新する

### 5.4 Row Level Security (RLS)

| ポリシー名 | 対象ロール | 操作 | 説明 |
|-----------|----------|------|------|
| 認証済みユーザーはすべての操作が可能 | authenticated | ALL | 全操作を許可 |
| 匿名ユーザーは閲覧のみ可能 | anon | SELECT | 読み取りのみ許可 |

### 5.5 ストレージ

- バケット名: `onigiriimage`
- 用途: おにぎりの写真と食べた時の写真を保存
- パス形式: `onigiri/{timestamp}-{random}.{ext}`

## 6. API設計

### 6.1 REST API エンドポイント (`/api/onigiri`)

| メソッド | 説明 | パラメータ |
|---------|------|----------|
| GET | おにぎり一覧取得 | クエリ: date, name, storeName, rating |
| POST | おにぎり新規作成 | ボディ: date, name, storeName, price, rating（必須）, imageUrl, eatImageUrl, memo（任意） |
| PUT | おにぎり更新 | ボディ: id（必須）, 更新フィールド |
| DELETE | おにぎり削除 | ボディ: id（必須） |

### 6.2 サービス層 (`OnigiriService`)

| メソッド | 説明 |
|---------|------|
| `getAll()` | 全おにぎりを作成日時降順で取得 |
| `getByDate(date)` | 指定日のおにぎりを取得 |
| `getByMonth(year, month)` | 指定月のおにぎりを日付昇順で取得 |
| `getById(id)` | IDでおにぎりを1件取得 |
| `create(onigiri)` | おにぎりを新規作成 |
| `update(id, updates)` | おにぎりを更新 |
| `delete(id)` | おにぎりを削除 |
| `search(params)` | 条件指定で検索（名前・店舗名は部分一致、価格・評価は範囲指定、日付は範囲指定） |

## 7. 機能詳細

### 7.1 おにぎり登録

1. カレンダーの日付セルをクリック
2. その日付におにぎりが未登録の場合、編集モード（登録フォーム）が開く
3. 必須フィールド（おにぎり名、店舗名、価格）を入力
4. 任意で評価（デフォルト3）、写真、メモを入力
5. 「保存」ボタンで `OnigiriService.create()` を呼び出し、データベースに保存
6. 保存後、ダイアログを閉じ、カレンダーの表示を更新

### 7.2 おにぎり閲覧・編集

1. カレンダーの日付セルをクリック
2. その日付におにぎりが登録済みの場合、表示モードで詳細を表示
3. 「編集」ボタンをクリックすると編集モードに切り替わる
4. フォームを変更後「保存」で `OnigiriService.update()` を呼び出し更新
5. 「キャンセル」で変更を破棄し表示モードに戻る

### 7.3 画像アップロード

1. 「画像を選択」ボタンからファイルを選択、またはURL直接入力
2. 対応形式: JPEG, PNG, GIF, WebP
3. クライアント側で `browser-image-resizer` によりリサイズ（最大幅500px、アスペクト比維持、品質0.85）
4. Supabase Storage の `onigiriimage` バケットにアップロード
5. 既存画像がある場合、アップロード前に旧画像をストレージから削除
6. アップロード完了後、公開URLをフォームに反映
7. アップロード中はスピナーを表示、エラー時はエラーメッセージを表示

### 7.4 検索

1. 検索画面で条件を入力し「検索」ボタンをクリック
2. `OnigiriService.search()` で条件に基づきデータベースを検索
3. 名前・店舗名は部分一致（ILIKE）、価格・評価は範囲指定
4. 結果をリスト表示
5. 結果をクリックすると、カレンダー画面に切り替わり該当月に自動移動し、詳細ダイアログが開く

### 7.5 ダークモード

- Tailwind CSS の `darkMode: "media"` 設定により、OS の `prefers-color-scheme` に自動追従
- CSS カスタムプロパティベースのカラーシステムを使用（`text-foreground`, `bg-card`, `bg-muted`, `bg-background`, `border-input`, `text-muted-foreground` 等）
- `globals.css` 内の `@media (prefers-color-scheme: dark)` でCSS変数が自動的に切り替わるため、JavaScriptによる手動検出は不要

### 7.6 モバイル対応

- レスポンシブグリッドレイアウト（1列〜3列）
- `env(safe-area-inset-bottom)` によるiPhoneのノッチ/ホームバー対応
- `100svh` による動的ビューポート高さ対応
- カレンダーセル: モバイル80px / デスクトップ128px（`h-20 sm:h-32`）
- おにぎりサムネイル画像: モバイルでは非表示（`hidden sm:block`）
- 曜日ヘッダー・日付テキスト: モバイルで小さいフォントサイズ（`text-xs sm:text-base`, `text-xs sm:text-sm`）
- セルパディング: `p-1 sm:p-2`

### 7.7 ローディングUI

- データ読み込み中はカレンダーグリッド型のスケルトンUIを表示
- ヘッダー（ナビゲーションボタン + 月名）、曜日ヘッダー（7個）、35セルの `animate-pulse` カードで構成
- 実際のカレンダーと同じレイアウトで表示されるため、コンテンツ表示後のレイアウトシフトを防止

## 8. 状態管理

React の `useState` フックによるローカルステート管理を採用。グローバル状態管理ライブラリは使用しない。

### 主要なステート

| ステート名 | 型 | 説明 |
|-----------|---|------|
| currentYear / currentMonth | number | 現在表示中のカレンダーの年月 |
| selectedDate | Date \| null | 選択中の日付 |
| isDialogOpen | boolean | ダイアログの表示状態 |
| viewMode | "calendar" \| "search" | 表示モード |
| onigiriData | Record<string, Onigiri[]> | 日付をキーとしたおにぎりデータ |
| selectedOnigiri | Onigiri \| undefined | 現在選択中のおにぎり |
| searchResults | Onigiri[] | 検索結果 |
| isLoading | boolean | データ読み込み中フラグ |

## 9. 環境変数

| 変数名 | 説明 |
|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 公開匿名キー |

## 10. 開発コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動（Turbopack） |
| `npm run build` | プロダクションビルド |
| `npm start` | プロダクションサーバー起動 |
| `npm run lint` | ESLint実行 |
| `npm test` | テスト実行 |
| `npm run test:watch` | テスト（ウォッチモード） |
| `npm run test:coverage` | テスト（カバレッジ付き） |
| `npm run test-supabase` | Supabase接続テスト |
| `npm run check-env` | 環境変数確認 |
