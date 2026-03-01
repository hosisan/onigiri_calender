"use client";

import React, { useState, useEffect, useRef } from "react";
import { Onigiri, CreateOnigiriInput } from "../../models/Onigiri";
import { formatDisplayDate, formatDateToString } from "../../utils/date-utils";
import { Button } from "../ui/button";
import { DialogTitle, DialogDescription } from "../ui/dialog";
import Image from "next/image";
import { supabase } from "../../utils/supabase";

/**
 * 星評価コンポーネント
 */
function StarRating({ rating, onRatingChange }: { rating: number; onRatingChange?: (value: number) => void }) {
  const stars = Array.from({ length: 5 }).map((_, index) => index + 1);
  
  return (
    <div className="flex space-x-1">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onRatingChange}
          onClick={() => onRatingChange?.(star)}
          className={`text-xl ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          } ${onRatingChange ? "cursor-pointer" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/**
 * おにぎり詳細ダイアログのProps
 */
interface OnigiriDialogProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onigiri?: Onigiri;
  onSave: (date: Date, onigiri: CreateOnigiriInput) => void;
}

/**
 * おにぎり詳細ダイアログコンポーネント
 * おにぎりの表示・編集を行います
 */
export function OnigiriDialog({ isOpen, onClose, date, onigiri, onSave }: OnigiriDialogProps) {
  // 編集モードかどうか
  const [isEditing, setIsEditing] = useState(!onigiri);
  
  // 初回レンダリングフラグ
  const isFirstRender = useRef(true);
  
  // 画像アップロード状態
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");

  // 画像URL入力の表示状態
  const [showImageUrlInput, setShowImageUrlInput] = useState(false);
  const [showEatImageUrlInput, setShowEatImageUrlInput] = useState(false);
  
  // Props変更時の処理
  useEffect(() => {
    // 日付が変わった場合、編集モードかどうかを再設定
    // onigiriがundefinedなら登録画面、存在すれば詳細画面
    setIsEditing(!onigiri);
    
    // フォームデータを更新
    setFormData({
      name: onigiri?.name || "",
      storeName: onigiri?.storeName || "",
      price: onigiri?.price ?? (null as unknown as number),
      imageUrl: onigiri?.imageUrl || "",
      eatImageUrl: onigiri?.eatImageUrl || "",
      rating: onigiri?.rating || 3,
      memo: onigiri?.memo || "",
      date: onigiri?.date || formatDateToString(date)
    });
    
    isFirstRender.current = false;
  }, [date, onigiri, isOpen]);
  
  // フォーム状態
  const [formData, setFormData] = useState<CreateOnigiriInput>({
    name: onigiri?.name || "",
    storeName: onigiri?.storeName || "",
    price: onigiri?.price ?? (null as unknown as number),
    imageUrl: onigiri?.imageUrl || "",
    eatImageUrl: onigiri?.eatImageUrl || "",
    rating: onigiri?.rating || 3,
    memo: onigiri?.memo || "",
    date: onigiri?.date || formatDateToString(date)
  });

  // 画像アップロード処理
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "imageUrl" | "eatImageUrl") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 画像ファイルかチェック
    if (!file.type.match(/^image\/(jpeg|png|gif|jpg|webp)$/)) {
      setImageUploadError("画像ファイル（JPEG、PNG、GIF、WebP）のみアップロードできます");
      return;
    }
    
    setIsImageUploading(true);
    setImageUploadError("");
    
    try {
      // Supabase接続の確認
      if (!supabase) {
        throw new Error("Supabase接続が初期化されていません");
      }
      
      // 既存の画像URLを取得
      const existingImageUrl = formData[fieldName];
      
      // 既存画像があれば削除処理
      if (existingImageUrl && existingImageUrl.includes('onigiri/')) {
        try {
          // 画像URLからストレージパスを抽出
          // 例: https://xxx.supabase.co/storage/v1/object/public/onigiriimage/onigiri/12345-abc.jpg
          // → onigiri/12345-abc.jpg
          const pathMatch = existingImageUrl.match(/\/onigiri\/[^/]+\.[^/?#]+/);
          if (pathMatch) {
            const imagePath = pathMatch[0].substring(1); // 先頭の'/'を削除
            console.log('削除する画像パス:', imagePath);
            
            // バケット名を確認（デフォルトは 'onigiriimage'）
            let bucketName = 'onigiriimage';
            if (existingImageUrl.includes('/public/')) {
              // URLからバケット名を抽出
              const bucketMatch = existingImageUrl.match(/\/public\/([^/]+)\//);
              if (bucketMatch && bucketMatch[1]) {
                bucketName = bucketMatch[1];
              }
            }
            
            // 既存画像をSupabaseストレージから削除
            const { error: removeError } = await supabase.storage
              .from(bucketName)
              .remove([imagePath]);
            
            if (removeError) {
              console.warn('既存画像の削除に失敗しました:', removeError);
            } else {
              console.log('既存画像を削除しました:', imagePath);
            }
          }
        } catch (deleteError) {
          console.warn('画像削除エラー:', deleteError);
          // 削除に失敗しても、新しい画像のアップロードは続行
        }
      }
      
      // 画像サイズ取得とアスペクト比計算のためのpromise
      const getImageAspectRatio = () => {
        return new Promise<number>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            const aspectRatio = img.height / img.width;
            resolve(aspectRatio);
          };
          
          // エラー時やタイムアウト時は1.0（正方形）のアスペクト比を使用
          img.onerror = () => resolve(1.0);
          
          // 画像オブジェクトにURLを設定
          img.src = URL.createObjectURL(file);
        });
      };
      
      // アスペクト比を取得
      const aspectRatio = await getImageAspectRatio();
      
      // ファイル名を一意にするためにタイムスタンプとランダム文字列を追加
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `onigiri/${fileName}`;
      
      let resizedImage: Blob | File = file;
      
      try {
        // browser-image-resizerを動的にインポート（クライアントサイドのみ）
        if (typeof window !== 'undefined') {
          const imageResizer = await import('browser-image-resizer');
          if (imageResizer && imageResizer.readAndCompressImage) {
            // 画像リサイズ設定（アスペクト比を維持）
            const targetWidth = 500;
            const targetHeight = Math.round(targetWidth * aspectRatio);
            
            const imageConfig = {
              quality: 0.85,
              maxWidth: targetWidth,
              maxHeight: targetHeight,
              autoRotate: true,
              debug: false,
            };
            
            // 画像をリサイズ
            resizedImage = await imageResizer.readAndCompressImage(file, imageConfig);
            console.log('画像をリサイズしました:', resizedImage.size, 'bytes');
          }
        }
      } catch (resizeError) {
        console.warn('画像リサイズに失敗しました。オリジナル画像を使用します:', resizeError);
        // リサイズに失敗しても、オリジナル画像でアップロードを続行
      }
      
      // バケット存在確認（エラーをキャッチしてもアップロードは試行）
      let bucketName = 'onigiriimage'; // デフォルトのバケット名
      try {
        // 複数の可能性のあるバケット名をテスト
        const bucketNames = ['onigiriimage'];
        let validBucketName = null;
        
        for (const name of bucketNames) {
          try {
            // バケットの存在を確認（from().list()を使用）
            const { data, error } = await supabase.storage.from(name).list('', { limit: 1 });
            
            if (!error) {
              console.log(`バケット '${name}' が存在します:`, data);
              validBucketName = name;
              break;
            } else {
              console.warn(`バケット '${name}' は利用できません:`, error);
              // バケットが見つからない場合はエラーを記録するだけ
              if (error.message.includes('not found') || error.message.includes('doesn\'t exist')) {
                console.error(`バケット '${name}' が見つかりません。管理者に連絡してバケットの作成を依頼してください。`);
              }
            }
          } catch (e) {
            console.warn(`バケット '${name}' チェック時にエラー:`, e);
          }
        }
        
        if (validBucketName) {
          console.log('有効なバケット名を見つけました:', validBucketName);
          bucketName = validBucketName; // 有効なバケット名を設定
        } else {
          console.error('有効なバケットが見つかりませんでした。');
        }
      } catch (bucketCheckError) {
        console.warn('バケット確認エラー:', bucketCheckError);
      }
      
      // Supabaseストレージにアップロード
      console.log(`Supabaseの '${bucketName}' バケットにアップロード開始:`, filePath);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, resizedImage, {
          cacheControl: '3600',
          upsert: true, // 同名ファイルが存在する場合は上書き
          contentType: file.type // 元のファイルのMIMEタイプを保持
        });
      
      if (error) {
        console.error('Supabaseアップロードエラー:', error);
        
        // エラータイプに応じたメッセージ
        if (error.message.includes('Permission')) {
          setImageUploadError("アップロード権限がありません。管理者に連絡してください。");
        } else if (error.message.includes('not found')) {
          setImageUploadError("バケットが見つかりません。設定を確認してください。");
        } else if (error.message.includes('row-level security policy') || error.message.includes('Unauthorized')) {
          setImageUploadError("セキュリティポリシー違反: Supabaseダッシュボードで'onigiriimage'バケットのRLSポリシーを確認してください。匿名ユーザーに書き込み権限を付与する必要があります。");
          console.error('RLSポリシーエラーの詳細:', error);
          console.info('解決方法: Supabaseダッシュボードで、匿名ユーザー(anon)に対してINSERT権限を付与するRLSポリシーを設定してください。');
        } else {
          setImageUploadError(`アップロードエラー: ${error.message}`);
        }
        
        throw error;
      }
      
      console.log('アップロード成功:', data);
      
      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
      
      console.log('公開URL:', publicUrl);
      
      // フォームデータを更新
      setFormData(prev => ({
        ...prev,
        [fieldName]: publicUrl
      }));
      
      setIsImageUploading(false);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      if (!imageUploadError) {
        // 既にエラーメッセージが設定されていない場合のみ設定
        setImageUploadError("画像のアップロードに失敗しました");
      }
      setIsImageUploading(false);
    }
  };

  // フォーム入力の変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? (value === "" ? (null as unknown as number) : parseInt(value, 10)) : value
    }));
  };
  
  // 評価の変更ハンドラ
  const handleRatingChange = (value: number) => {
    setFormData((prev) => ({
      ...prev,
      rating: value
    }));
  };
  
  // 保存ハンドラ
  const handleSave = () => {
    // 必須フィールドのバリデーション
    if (!formData.name || !formData.storeName) {
      return;
    }
    
    // 保存処理中にボタンを無効化するなどのUI処理があればここに追加
    
    // 親コンポーネントのonSaveを呼び出して保存
    // onSave内部でダイアログが閉じるので、ここではsetIsEditingのみ行う
    onSave(date, formData);
    setIsEditing(false);
    
    // 確認メッセージをコンソールに出力（デバッグ用）
    console.log('おにぎりを保存します:', formData);
  };
  
  // ダイアログを閉じる処理
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };
  
  // 編集モードの切り替え
  const toggleEditMode = () => {
    if (isEditing) {
      // 編集をキャンセルした場合は元の値に戻す
      setFormData({
        name: onigiri?.name || "",
        storeName: onigiri?.storeName || "",
        price: onigiri?.price ?? (null as unknown as number),
        imageUrl: onigiri?.imageUrl || "",
        eatImageUrl: onigiri?.eatImageUrl || "",
        rating: onigiri?.rating || 3,
        memo: onigiri?.memo || "",
        date: onigiri?.date || formatDateToString(date)
      });
    }
    setIsEditing(!isEditing);
  };

  // モーダルスタイルのダイアログとして実装
  return (
    <div className="w-full h-full flex flex-col bg-card max-h-[100svh]">
      <div className="flex justify-between items-center p-3 border-b bg-card border-border sticky top-0 z-10">
        <div>
          <DialogTitle className="text-xl font-bold text-foreground">
            {isEditing
              ? `${formatDisplayDate(date)}のおにぎりを${onigiri ? '編集' : '登録'}`
              : `${formatDisplayDate(date)}のおにぎり`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            おにぎりの詳細情報を表示・編集します
          </DialogDescription>
          {!isEditing && onigiri && (
            <p className="text-sm text-muted-foreground">
              {onigiri.name} - {onigiri.storeName}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-muted text-foreground"
          aria-label="閉じる"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div
        className="p-3 overflow-y-auto flex-1 bg-card"
        style={{ height: 'calc(100svh - 120px - env(safe-area-inset-bottom, 0px))' }}
      >
        {isEditing ? (
          // 編集フォーム
          <form className="space-y-3 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
                  おにぎり名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
              
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-foreground mb-1">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
                  価格 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    value={formData.price === null ? "" : formData.price}
                    onChange={handleChange}
                    className="w-full p-2 pr-8 border border-input rounded-md bg-background text-foreground"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    円
                  </span>
                </div>
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-foreground mb-1">
                  評価
                </label>
                <StarRating rating={formData.rating} onRatingChange={handleRatingChange} />
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground mb-1">
                  おにぎりの写真
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "imageUrl")}
                      className="hidden"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="cursor-pointer px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm text-foreground"
                    >
                      画像を選択
                    </label>
                    {isImageUploading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
                    )}
                    {imageUploadError && (
                      <p className="text-xs text-red-500">{imageUploadError}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowImageUrlInput(!showImageUrlInput)}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    {showImageUrlInput ? "URL入力を閉じる" : "URLを直接入力する"}
                  </button>
                  {showImageUrlInput && (
                    <input
                      type="text"
                      id="imageUrl"
                      name="imageUrl"
                      value={formData.imageUrl || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                      placeholder="https://example.com/image.jpg"
                    />
                  )}
                </div>
                {formData.imageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-foreground mb-1">プレビュー:</p>
                    <div className="rounded-md overflow-hidden">
                      <div className="relative w-full" style={{ maxWidth: '100%', height: '120px' }}>
                        <Image
                          src={formData.imageUrl}
                          alt="プレビュー"
                          fill
                          sizes="(max-width: 500px) 100vw, 500px"
                          className="object-contain rounded-md"
                          onError={(e) => {
                            // @ts-ignore エラー時にフォールバック画像を設定
                            e.currentTarget.src = "/images/onigiri-sample-1.jpg";
                            // @ts-ignore
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="eatImageUrl" className="block text-sm font-medium text-foreground mb-1">
                  食べた時の写真
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      id="eatImageUpload"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "eatImageUrl")}
                      className="hidden"
                    />
                    <label
                      htmlFor="eatImageUpload"
                      className="cursor-pointer px-4 py-2 bg-muted hover:bg-muted/80 rounded-md text-sm text-foreground"
                    >
                      画像を選択
                    </label>
                    {isImageUploading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500"></div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEatImageUrlInput(!showEatImageUrlInput)}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    {showEatImageUrlInput ? "URL入力を閉じる" : "URLを直接入力する"}
                  </button>
                  {showEatImageUrlInput && (
                    <input
                      type="text"
                      id="eatImageUrl"
                      name="eatImageUrl"
                      value={formData.eatImageUrl || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                      placeholder="https://example.com/image.jpg"
                    />
                  )}
                </div>
                {formData.eatImageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-foreground mb-1">プレビュー:</p>
                    <div className="rounded-md overflow-hidden">
                      <div className="relative w-full" style={{ maxWidth: '100%', height: '120px' }}>
                        <Image
                          src={formData.eatImageUrl}
                          alt={`${formData.name}を食べたところ`}
                          fill
                          sizes="(max-width: 500px) 100vw, 500px"
                          className="object-contain rounded-md"
                          onError={(e) => {
                            // @ts-ignore エラー時にフォールバック画像を設定
                            e.currentTarget.src = "/images/onigiri-sample-1.jpg";
                            // @ts-ignore
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-foreground mb-1">
                メモ
              </label>
              <textarea
                id="memo"
                name="memo"
                rows={1}
                value={formData.memo || ""}
                onChange={handleChange}
                className="w-full p-2 border border-input rounded-md bg-background text-foreground"
              />
            </div>
          </form>
        ) : onigiri ? (
          // 詳細表示
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-foreground">おにぎり名</h3>
                <p className="mt-1 text-sm text-foreground">{onigiri.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground">店舗名</h3>
                <p className="mt-1 text-sm text-foreground">{onigiri.storeName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground">価格</h3>
                <p className="mt-1 text-sm text-foreground">{onigiri.price}円</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-foreground">評価</h3>
                <div className="mt-1">
                  <StarRating rating={onigiri.rating} />
                </div>
              </div>
            </div>
            
            {/* 画像表示 - iPhone Safariでボタンが隠れないよう調整 */}
            {(onigiri.imageUrl || onigiri.eatImageUrl) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {onigiri.imageUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">おにぎりの写真</h3>
                    <div className="rounded-md overflow-hidden">
                      <div className="relative w-full" style={{ maxWidth: '100%', height: '100px' }}>
                        <Image
                          src={onigiri.imageUrl}
                          alt={onigiri.name}
                          fill
                          sizes="(max-width: 500px) 100vw, 500px"
                          className="object-contain rounded-md"
                          onError={(e) => {
                            // @ts-ignore エラー時にフォールバック画像を設定
                            e.currentTarget.src = "/images/onigiri-sample-1.jpg";
                            // @ts-ignore
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {onigiri.eatImageUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-foreground mb-1">食べた時の写真</h3>
                    <div className="rounded-md overflow-hidden">
                      <div className="relative w-full" style={{ maxWidth: '100%', height: '100px' }}>
                        <Image
                          src={onigiri.eatImageUrl}
                          alt={`${onigiri.name}を食べたところ`}
                          fill
                          sizes="(max-width: 500px) 100vw, 500px"
                          className="object-contain rounded-md"
                          onError={(e) => {
                            // @ts-ignore エラー時にフォールバック画像を設定
                            e.currentTarget.src = "/images/onigiri-sample-1.jpg";
                            // @ts-ignore
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* メモ */}
            {onigiri.memo && (
              <div>
                <h3 className="text-sm font-medium text-foreground">メモ</h3>
                <p className="mt-1 text-sm text-foreground whitespace-pre-line line-clamp-3">{onigiri.memo}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
      
      <div className="p-3 pt-2 pb-5 border-t border-border flex justify-end space-x-2 bg-card sticky bottom-0 z-10" style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}>
        {isEditing ? (
          <>
            {onigiri && (
              <Button variant="outline" onClick={toggleEditMode} className="px-3 py-1 sm:px-4 sm:py-2">
                キャンセル
              </Button>
            )}
            <Button onClick={handleSave} disabled={!formData.name || !formData.storeName} className="px-3 py-1 sm:px-4 sm:py-2">
              保存
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onClose} className="px-3 py-1 sm:px-4 sm:py-2">
              閉じる
            </Button>
            {onigiri && (
              <Button onClick={toggleEditMode} className="px-3 py-1 sm:px-4 sm:py-2">
                編集
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
} 