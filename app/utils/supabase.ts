import { createClient } from '@supabase/supabase-js';

// ダイレクトにprocessから環境変数を取得
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 接続情報が設定されているかチェック
const isConfigured = Boolean(supabaseUrl) && Boolean(supabaseKey);

// 接続情報がない場合はコンソールに警告を表示
if (!isConfigured) {
  console.error('Supabase接続情報が設定されていません。.env.localファイルを作成し、以下の設定を追加してください：');
  console.error('NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
}

// Supabaseクライアントの初期化
// 環境変数が設定されていない場合はダミーの値を使用（実際には接続できません）
export const supabase = createClient(
  supabaseUrl || 'https://dummy-project.supabase.co',
  supabaseKey || 'dummy-key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
);

// 設定状態をエクスポート
export const isSupabaseConfigured = isConfigured;

// 接続とストレージの存在確認
if (typeof window !== 'undefined') {
  // クライアントサイドでのみ実行
  try {
    // getBucket()の代わりに.from().list()を使用
    // 'onigiriimage'バケット内のファイル一覧を取得するテスト
    supabase.storage.from('onigiriimage').list()
      .then(response => {
        if (response.error) {
          console.error('Supabaseのストレージバケット「onigiriimage」のファイル一覧取得エラー:', response.error);
        } else {
          console.log('Supabaseストレージバケット「onigiriimage」に接続しました。', 
            `${response.data?.length || 0}個のファイルが見つかりました`);
        }
      })
      .catch(err => {
        console.error('Supabaseストレージの接続テストに失敗しました:', err);
      });
  } catch (err) {
    console.error('Supabaseストレージの接続テストに失敗しました:', err);
  }
} 