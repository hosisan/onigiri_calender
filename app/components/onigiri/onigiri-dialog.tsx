"use client";

import React, { useState, useEffect, useRef } from "react";
import { Onigiri, CreateOnigiriInput } from "../../models/Onigiri";
import { formatDisplayDate, formatDateToString } from "../../utils/date-utils";
import { Button } from "../ui/button";
import { DialogTitle, DialogDescription } from "../ui/dialog";
import { Trash2 } from "lucide-react";
import { deleteImageByUrl, uploadImage } from "../../services/image-service";
import { OnigiriForm } from "./onigiri-form";
import { OnigiriDetailView } from "./onigiri-detail-view";

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

  // Xポストインポートセクションのリマウント用key（ダイアログ再オープン時に状態をリセットする）
  const tweetImportKey = `${isOpen}-${onigiri?.id ?? "new"}-${formatDateToString(date)}`;

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
      // 既存の画像URLを取得し、あれば削除処理（ベストエフォート）
      const existingImageUrl = formData[fieldName];
      if (existingImageUrl) {
        await deleteImageByUrl(existingImageUrl);
      }

      const publicUrl = await uploadImage(file);

      setFormData(prev => ({
        ...prev,
        [fieldName]: publicUrl
      }));

      setIsImageUploading(false);
    } catch (error) {
      console.error('画像アップロードエラー:', error);
      if (error instanceof Error && error.message) {
        setImageUploadError(error.message);
      } else if (!imageUploadError) {
        setImageUploadError("画像のアップロードに失敗しました");
      }
      setIsImageUploading(false);
    }
  };

  // Xポストのテキストデータをフォームに反映（空フィールドのみ）
  const handleTweetTextFetched = ({ text, parsed }: { text: string; parsed: { name?: string; storeName?: string; price?: number } }) => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name || parsed.name || "",
      storeName: prev.storeName || parsed.storeName || "",
      price: prev.price ?? parsed.price ?? 0,
      memo: prev.memo || text || "",
    }));
  };

  // Xポストの画像をフォームに反映
  const handleTweetImagesUploaded = (imageUrl: string, eatImageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      imageUrl,
      eatImageUrl,
    }));
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

  // ダイアログを閉じる処理（Radix Dialog向け、未使用時の将来的な拡張のため保持）
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
          <OnigiriForm
            formData={formData}
            touched={touched}
            isImageUploading={isImageUploading}
            imageUploadError={imageUploadError}
            showImageUrlInput={showImageUrlInput}
            showEatImageUrlInput={showEatImageUrlInput}
            tweetImportKey={tweetImportKey}
            onChange={handleChange}
            onBlur={handleBlur}
            onRatingChange={handleRatingChange}
            onImageUpload={handleImageUpload}
            onToggleImageUrlInput={() => setShowImageUrlInput(!showImageUrlInput)}
            onToggleEatImageUrlInput={() => setShowEatImageUrlInput(!showEatImageUrlInput)}
            onTweetTextFetched={handleTweetTextFetched}
            onTweetImagesUploaded={handleTweetImagesUploaded}
            onTweetUploadingChange={setIsImageUploading}
          />
        ) : onigiri ? (
          // 詳細表示
          <OnigiriDetailView onigiri={onigiri} />
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
