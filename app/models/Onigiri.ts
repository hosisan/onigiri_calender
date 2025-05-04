/**
 * おにぎりデータモデル
 * データベース移行に備えて拡張性を持たせた設計
 */
export interface Onigiri {
  id: string; // データベースで生成されるUUID（UI表示には使用しない）
  date: string; // 登録した年月日（YYYY-MM-DD形式）
  name: string; // おにぎり名
  storeName: string; // 店舗名
  price: number; // 価格
  imageUrl?: string; // おにぎりの写真
  eatImageUrl?: string; // 食べた時の写真
  rating: number; // 評価（1-5）
  memo?: string; // メモ
  createdAt: string; // 作成日時
  updatedAt: string; // 更新日時
}

/**
 * 新規おにぎり作成用の部分的なインターフェース
 */
export type CreateOnigiriInput = Omit<Onigiri, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * おにぎり更新用の部分的なインターフェース
 */
export type UpdateOnigiriInput = Partial<Omit<Onigiri, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * おにぎり検索パラメータ
 */
export interface OnigiriSearchParams {
  name?: string;
  storeName?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
  dateFrom?: string;
  dateTo?: string;
} 