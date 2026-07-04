import { supabase } from '../utils/supabase';

const STORAGE_BUCKET = 'onigiriimage';

/**
 * SupabaseストレージのURLからバケット名とパスを抽出する
 */
export function parseStorageImageUrl(url: string): { bucket: string; path: string } | null {
  const pathMatch = url.match(/\/onigiri\/[^/]+\.[^/?#]+/);
  if (!pathMatch) return null;

  const path = pathMatch[0].substring(1);

  let bucket = STORAGE_BUCKET;
  if (url.includes('/public/')) {
    const bucketMatch = url.match(/\/public\/([^/]+)\//);
    if (bucketMatch && bucketMatch[1]) {
      bucket = bucketMatch[1];
    }
  }

  return { bucket, path };
}

/**
 * 画像URLからSupabaseストレージ上の画像を削除する（ベストエフォート）
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  if (!url || !url.includes('onigiri/')) return;

  try {
    const parsed = parseStorageImageUrl(url);
    if (!parsed) return;

    const { error } = await supabase.storage
      .from(parsed.bucket)
      .remove([parsed.path]);

    if (error) {
      console.warn('画像の削除に失敗しました:', error);
    }
  } catch (deleteError) {
    console.warn('画像削除エラー:', deleteError);
  }
}

/**
 * 画像のアスペクト比を取得する
 */
function getImageAspectRatio(file: File | Blob): Promise<number> {
  return new Promise<number>((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const aspectRatio = img.height / img.width;
      resolve(aspectRatio);
    };
    img.onerror = () => resolve(1.0);
    img.src = URL.createObjectURL(file);
  });
}

/**
 * SupabaseアップロードエラーをUI表示用の日本語メッセージに変換する
 */
function mapUploadErrorMessage(error: { message: string }): string {
  if (error.message.includes('Permission')) {
    return 'アップロード権限がありません。管理者に連絡してください。';
  } else if (error.message.includes('not found')) {
    return 'バケットが見つかりません。設定を確認してください。';
  } else if (error.message.includes('row-level security policy') || error.message.includes('Unauthorized')) {
    console.error('RLSポリシーエラーの詳細:', error);
    console.info('解決方法: Supabaseダッシュボードで、匿名ユーザー(anon)に対してINSERT権限を付与するRLSポリシーを設定してください。');
    return "セキュリティポリシー違反: Supabaseダッシュボードで'onigiriimage'バケットのRLSポリシーを確認してください。匿名ユーザーに書き込み権限を付与する必要があります。";
  } else {
    return `アップロードエラー: ${error.message}`;
  }
}

/**
 * 画像ファイルをリサイズしてSupabaseストレージにアップロードする
 */
export async function uploadImage(file: File | Blob, fileName?: string): Promise<string> {
  const aspectRatio = await getImageAspectRatio(file);

  let filePath: string;
  if (fileName) {
    filePath = `onigiri/${fileName}`;
  } else {
    const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
    const generatedName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    filePath = `onigiri/${generatedName}`;
  }

  let resizedImage: Blob | File = file;

  try {
    if (typeof window !== 'undefined' && file instanceof File) {
      const imageResizer = await import('browser-image-resizer');
      if (imageResizer && imageResizer.readAndCompressImage) {
        const targetWidth = 500;
        const targetHeight = Math.round(targetWidth * aspectRatio);

        const imageConfig = {
          quality: 0.85,
          maxWidth: targetWidth,
          maxHeight: targetHeight,
          autoRotate: true,
          debug: false,
        };

        resizedImage = await imageResizer.readAndCompressImage(file, imageConfig);
        console.log('画像をリサイズしました:', resizedImage.size, 'bytes');
      }
    }
  } catch (resizeError) {
    console.warn('画像リサイズに失敗しました。オリジナル画像を使用します:', resizeError);
  }

  console.log(`Supabaseの '${STORAGE_BUCKET}' バケットにアップロード開始:`, filePath);
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, resizedImage, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    });

  if (error) {
    console.error('Supabaseアップロードエラー:', error);
    throw new Error(mapUploadErrorMessage(error));
  }

  console.log('アップロード成功:', data);

  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  console.log('公開URL:', publicUrl);

  return publicUrl;
}

/**
 * 画像URLからダウンロードしてSupabaseストレージにアップロードする
 */
export async function downloadAndUploadImage(imageUrl: string): Promise<string> {
  const resp = await fetch(imageUrl);
  const blob = await resp.blob();
  const file = new File([blob], 'tweet-image.jpg', { type: blob.type || 'image/jpeg' });

  return uploadImage(file);
}
