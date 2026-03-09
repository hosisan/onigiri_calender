"use client";

import React, { useState, useEffect, useRef } from "react";
import { Onigiri, CreateOnigiriInput } from "../../models/Onigiri";
import { formatDisplayDate, formatDateToString } from "../../utils/date-utils";
import { Button } from "../ui/button";
import { DialogTitle, DialogDescription } from "../ui/dialog";
import Image from "next/image";
import { supabase } from "../../utils/supabase";
import { Plus, Trash2 } from "lucide-react";

/**
 * 星評価コンポーネント
 */
function StarRating({ rating, onRatingChange }: { rating: number; onRatingChange?: (value: number) => void }) {
  const stars = Array.from({ length: 5 }).map((_, index) => index + 1);

  return (
    <div className="flex gap-2">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onRatingChange}
          onClick={() => onRatingChange?.(star)}
          className={`text-3xl p-1 transition-transform ${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          } ${onRatingChange ? "cursor-pointer active:scale-110" : "cursor-default"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/**
 * フォームセクションコンポーネント
 */
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground border-b border-border pb-1">
        {title}
      </h3>
      <div className="space-y-3">
        {children}
      </div>
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
  onDelete?: (onigiri: Onigiri) => void;
}

/**
 * おにぎり詳細ダイアログコンポーネント
 * おにぎりの表示・編集を行います
 */
export function OnigiriDialog({ isOpen, onClose, date, onigiri, onSave, onDelete }: OnigiriDialogProps) {
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

  // バリデーション: タッチ済みフィールドの追跡
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 削除確認状態
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Props変更時の処理
  useEffect(() => {
    setIsEditing(!onigiri);

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

    setTouched({});
    setIsDeleteConfirming(false);
    setIsDeleting(false);

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
          const pathMatch = existingImageUrl.match(/\/onigiri\/[^/]+\.[^/?#]+/);
          if (pathMatch) {
            const imagePath = pathMatch[0].substring(1);
            console.log('削除する画像パス:', imagePath);

            let bucketName = 'onigiriimage';
            if (existingImageUrl.includes('/public/')) {
              const bucketMatch = existingImageUrl.match(/\/public\/([^/]+)\//);
              if (bucketMatch && bucketMatch[1]) {
                bucketName = bucketMatch[1];
              }
            }

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
        }
      }

      // 画像サイズ取得とアスペクト比計算
      const getImageAspectRatio = () => {
        return new Promise<number>((resolve) => {
          const img = new window.Image();
          img.onload = () => {
            const aspectRatio = img.height / img.width;
            resolve(aspectRatio);
          };
          img.onerror = () => resolve(1.0);
          img.src = URL.createObjectURL(file);
        });
      };

      const aspectRatio = await getImageAspectRatio();

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `onigiri/${fileName}`;

      let resizedImage: Blob | File = file;

      try {
        if (typeof window !== 'undefined') {
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

      let bucketName = 'onigiriimage';
      try {
        const bucketNames = ['onigiriimage'];
        let validBucketName = null;

        for (const name of bucketNames) {
          try {
            const { data, error } = await supabase.storage.from(name).list('', { limit: 1 });

            if (!error) {
              console.log(`バケット '${name}' が存在します:`, data);
              validBucketName = name;
              break;
            } else {
              console.warn(`バケット '${name}' は利用できません:`, error);
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
          bucketName = validBucketName;
        } else {
          console.error('有効なバケットが見つかりませんでした。');
        }
      } catch (bucketCheckError) {
        console.warn('バケット確認エラー:', bucketCheckError);
      }

      console.log(`Supabaseの '${bucketName}' バケットにアップロード開始:`, filePath);
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, resizedImage, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (error) {
        console.error('Supabaseアップロードエラー:', error);

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

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('公開URL:', publicUrl);

      setFormData(prev => ({
        ...prev,
        [fieldName]: publicUrl
      }));

      setIsImageUploading(false);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      if (!imageUploadError) {
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

  // フィールドのblurハンドラ（バリデーション用）
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
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
      // 全必須フィールドをtouchedにしてエラー表示
      setTouched({ name: true, storeName: true, price: true });
      return;
    }

    onSave(date, formData);
    setIsEditing(false);

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
      setTouched({});
    }
    setIsEditing(!isEditing);
  };

  // 削除ハンドラ
  const handleDelete = async () => {
    if (!onigiri || !onDelete) return;
    setIsDeleting(true);
    try {
      await onDelete(onigiri);
    } catch {
      setIsDeleting(false);
      setIsDeleteConfirming(false);
    }
  };

  return (
    <div className="w-full flex flex-col bg-card flex-1 min-h-0">
      {/* ヘッダー */}
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

      {/* コンテンツ */}
      <div className="p-3 overflow-y-auto flex-1 bg-card">
        {isEditing ? (
          // 編集フォーム
          <form className="space-y-5 py-2">
            {/* セクション: 基本情報 */}
            <FormSection title="基本情報">
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
                    onBlur={handleBlur}
                    className={`w-full p-2 border rounded-md bg-background text-foreground ${
                      touched.name && !formData.name
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-input"
                    }`}
                  />
                  {touched.name && !formData.name && (
                    <p className="text-xs text-red-500 mt-1">おにぎり名は必須です</p>
                  )}
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
                    onBlur={handleBlur}
                    className={`w-full p-2 border rounded-md bg-background text-foreground ${
                      touched.storeName && !formData.storeName
                        ? "border-red-500 ring-1 ring-red-500"
                        : "border-input"
                    }`}
                  />
                  {touched.storeName && !formData.storeName && (
                    <p className="text-xs text-red-500 mt-1">店舗名は必須です</p>
                  )}
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
                      onBlur={handleBlur}
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
              </div>
            </FormSection>

            {/* セクション: 写真 */}
            <FormSection title="写真">
              <div className="grid grid-cols-2 gap-3">
                {/* おにぎりの写真 */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    おにぎりの写真
                  </label>
                  <label
                    htmlFor="imageUpload"
                    className={`relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                      formData.imageUrl
                        ? "border-solid border-border"
                        : "border-input bg-muted/30 hover:bg-muted/50 hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="file"
                      id="imageUpload"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "imageUrl")}
                      className="hidden"
                    />
                    {formData.imageUrl ? (
                      <Image
                        src={formData.imageUrl}
                        alt="プレビュー"
                        fill
                        sizes="(max-width: 500px) 50vw, 250px"
                        className="object-cover rounded-xl"
                        onError={(e) => {
                          // @ts-ignore
                          e.currentTarget.src = "/images/onigiri-sample-1.jpg";
                          // @ts-ignore
                          e.currentTarget.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <Plus className="h-8 w-8" />
                        <span className="text-xs">写真を追加</span>
                      </div>
                    )}
                    {isImageUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                      </div>
                    )}
                  </label>
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
                      className="w-full p-2 border border-input rounded-md bg-background text-foreground text-xs"
                      placeholder="https://example.com/image.jpg"
                    />
                  )}
                </div>

                {/* 食べた時の写真 */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground mb-1">
                    食べた時の写真
                  </label>
                  <label
                    htmlFor="eatImageUpload"
                    className={`relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                      formData.eatImageUrl
                        ? "border-solid border-border"
                        : "border-input bg-muted/30 hover:bg-muted/50 hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="file"
                      id="eatImageUpload"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "eatImageUrl")}
                      className="hidden"
                    />
                    {formData.eatImageUrl ? (
                      <Image
                        src={formData.eatImageUrl}
                        alt="プレビュー"
                        fill
                        sizes="(max-width: 500px) 50vw, 250px"
                        className="object-cover rounded-xl"
                        onError={(e) => {
                          // @ts-ignore
                          e.currentTarget.src = "/images/onigiri-sample-1.jpg";
                          // @ts-ignore
                          e.currentTarget.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <Plus className="h-8 w-8" />
                        <span className="text-xs">写真を追加</span>
                      </div>
                    )}
                    {isImageUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                      </div>
                    )}
                  </label>
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
                      className="w-full p-2 border border-input rounded-md bg-background text-foreground text-xs"
                      placeholder="https://example.com/image.jpg"
                    />
                  )}
                </div>
              </div>
              {imageUploadError && (
                <p className="text-xs text-red-500">{imageUploadError}</p>
              )}
            </FormSection>

            {/* セクション: メモ */}
            <FormSection title="メモ">
              <div>
                <textarea
                  id="memo"
                  name="memo"
                  rows={2}
                  value={formData.memo || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-input rounded-md bg-background text-foreground"
                  placeholder="おにぎりの感想やメモを入力..."
                />
              </div>
            </FormSection>
          </form>
        ) : onigiri ? (
          // 詳細表示
          <div className="space-y-4 py-2">
            {/* ヒーロー画像 */}
            {onigiri.imageUrl && (
              <div className="relative w-full h-48 -mx-3 -mt-2 overflow-hidden" style={{ width: 'calc(100% + 1.5rem)' }}>
                <Image
                  src={onigiri.imageUrl}
                  alt={onigiri.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover"
                  onError={(e) => {
                    // @ts-ignore
                    e.currentTarget.src = "/images/onigiri-sample-1.jpg";
                    // @ts-ignore
                    e.currentTarget.onerror = null;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                <h2 className="absolute bottom-3 left-4 text-xl font-bold text-white drop-shadow-md">
                  {onigiri.name}
                </h2>
              </div>
            )}

            {/* 情報カード */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">店舗</p>
                <p className="text-sm font-medium text-foreground truncate">{onigiri.storeName}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">価格</p>
                <p className="text-sm font-medium text-foreground">{onigiri.price}円</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-xs text-muted-foreground">評価</p>
                <div className="flex justify-center mt-0.5">
                  <StarRating rating={onigiri.rating} />
                </div>
              </div>
            </div>

            {/* 写真比較 */}
            {(onigiri.imageUrl || onigiri.eatImageUrl) && (
              <div className="grid grid-cols-2 gap-2">
                {onigiri.imageUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">おにぎり</p>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={onigiri.imageUrl}
                        alt={onigiri.name}
                        fill
                        sizes="(max-width: 500px) 50vw, 250px"
                        className="object-cover"
                        onError={(e) => {
                          // @ts-ignore
                          e.currentTarget.src = "/images/onigiri-sample-1.jpg";
                          // @ts-ignore
                          e.currentTarget.onerror = null;
                        }}
                      />
                    </div>
                  </div>
                )}

                {onigiri.eatImageUrl && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">食べた写真</p>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <Image
                        src={onigiri.eatImageUrl}
                        alt={`${onigiri.name}を食べたところ`}
                        fill
                        sizes="(max-width: 500px) 50vw, 250px"
                        className="object-cover"
                        onError={(e) => {
                          // @ts-ignore
                          e.currentTarget.src = "/images/onigiri-sample-1.jpg";
                          // @ts-ignore
                          e.currentTarget.onerror = null;
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* メモ */}
            {onigiri.memo && (
              <div>
                <h3 className="text-sm font-medium text-foreground">メモ</h3>
                <p className="mt-1 text-sm text-foreground whitespace-pre-line">{onigiri.memo}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* フッター */}
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
            {isDeleteConfirming ? (
              <>
                <p className="text-sm text-destructive mr-auto self-center">本当に削除しますか？</p>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteConfirming(false)}
                  disabled={isDeleting}
                  className="px-3 py-1 sm:px-4 sm:py-2"
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1 sm:px-4 sm:py-2"
                >
                  {isDeleting ? "削除中..." : "削除する"}
                </Button>
              </>
            ) : (
              <>
                {onigiri && onDelete && (
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteConfirming(true)}
                    className="px-3 py-1 sm:px-4 sm:py-2 text-destructive hover:text-destructive-foreground hover:bg-destructive mr-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    削除
                  </Button>
                )}
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
          </>
        )}
      </div>
    </div>
  );
}
