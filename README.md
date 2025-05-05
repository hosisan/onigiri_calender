This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Supabase設定

このプロジェクトはバックエンドにSupabaseを使用しています。以下の手順で設定を行ってください。

### 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスし、アカウントを作成またはログインします。
2. 「New Project」をクリックし、新しいプロジェクトを作成します。
3. プロジェクト名、データベースパスワード、リージョンを設定します。
4. 「Create new project」をクリックしてプロジェクトを作成します。

### 2. データベーススキーマの設定

1. Supabaseプロジェクトのダッシュボードで「SQL Editor」を選択します。
2. 「New Query」ボタンをクリックします。
3. 以下のSQLクエリを貼り付けて実行します（このクエリは `app/config/supabase-setup.sql` にも保存されています）:

```sql
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
```

### 3. 環境変数の設定

1. Supabaseプロジェクトのダッシュボードで「Project Settings」を選択します。
2. 「API」タブを開きます。
3. 「Project URL」と「anon public」キーをコピーします。
4. プロジェクトのルートディレクトリに `.env.local` ファイルを作成し、以下の内容を記述します:

```
NEXT_PUBLIC_SUPABASE_URL=あなたのプロジェクトURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=あなたの公開anon key
```

### 4. サンプルデータの追加（オプション）

1. SQL Editorで新しいクエリを作成します。
2. 以下のSQLを実行してサンプルデータを追加します:

```sql
INSERT INTO public.onigiri (date, name, storeName, price, rating, memo)
VALUES
  ('2023-01-15', '鮭おにぎり', 'ファミリーマート', 150, 4, '朝食に食べました。塩加減が絶妙でした。'),
  ('2023-02-05', 'ツナマヨおにぎり', 'セブンイレブン', 160, 5, 'ツナの量が多くて満足感がありました。'),
  ('2023-03-10', '明太子おにぎり', 'ローソン', 180, 5, '明太子の辛さが絶妙でした。また買いたい。'),
  ('2023-04-22', '高菜おにぎり', 'ファミリーマート', 150, 4, '高菜の味が効いていて美味しかった。'),
  ('2023-05-08', '梅おにぎり', 'セブンイレブン', 140, 3, '梅の酸味が強すぎた。');
```

これで、Supabaseとの連携が完了しました。アプリケーションを起動すると、Supabaseのデータを利用することができます。

### 5. Supabase接続テスト

環境変数の設定後、Supabaseへの接続が正しく機能しているかテストできます：

```bash
npm run test-supabase
```

このコマンドは以下のテストを実行します：
1. Supabase APIへの接続
2. データベースの読み取りアクセス（onigiriテーブル）
3. ストレージバケットへのアクセス
4. テスト用ファイルのアップロードと削除

テストが成功すると、「すべてのテストが成功しました！」というメッセージが表示されます。
接続に問題がある場合は、詳細なエラーメッセージが表示され、トラブルシューティングに役立ちます。
