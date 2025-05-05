-- onigiriテーブルの作成
CREATE TABLE IF NOT EXISTS public.onigiri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  name TEXT NOT NULL,
  storeName TEXT NOT NULL,
  price INT4 NOT NULL,
  imageUrl TEXT,
  eatImageUrl TEXT,
  rating INT4 NOT NULL,
  memo TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT now(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 更新時にupdatedAtを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updatedAt = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成（既に存在しない場合のみ）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'onigiri_updated_at_trigger'
  ) THEN
    CREATE TRIGGER onigiri_updated_at_trigger
    BEFORE UPDATE ON public.onigiri
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;

-- RLSを有効化
ALTER TABLE public.onigiri ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーがすべての操作を行えるポリシー
CREATE POLICY "認証済みユーザーはすべての操作が可能" 
ON public.onigiri 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 匿名ユーザーは読み取りのみ可能
CREATE POLICY "匿名ユーザーは閲覧のみ可能" 
ON public.onigiri 
FOR SELECT 
TO anon 
USING (true);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS onigiri_date_idx ON public.onigiri (date);
CREATE INDEX IF NOT EXISTS onigiri_name_idx ON public.onigiri (name);
CREATE INDEX IF NOT EXISTS onigiri_storename_idx ON public.onigiri (storeName);

-- コメント追加
COMMENT ON TABLE public.onigiri IS 'おにぎりデータを管理するテーブル';
COMMENT ON COLUMN public.onigiri.id IS 'ユニークID（UUID形式）';
COMMENT ON COLUMN public.onigiri.date IS '登録した年月日（YYYY-MM-DD形式）';
COMMENT ON COLUMN public.onigiri.name IS 'おにぎり名';
COMMENT ON COLUMN public.onigiri.storeName IS '店舗名';
COMMENT ON COLUMN public.onigiri.price IS '価格';
COMMENT ON COLUMN public.onigiri.imageUrl IS 'おにぎりの写真URL';
COMMENT ON COLUMN public.onigiri.eatImageUrl IS '食べた時の写真URL';
COMMENT ON COLUMN public.onigiri.rating IS '評価（1-5）';
COMMENT ON COLUMN public.onigiri.memo IS 'メモ';
COMMENT ON COLUMN public.onigiri.createdAt IS '作成日時';
COMMENT ON COLUMN public.onigiri.updatedAt IS '更新日時'; 