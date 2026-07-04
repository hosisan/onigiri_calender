"use client";

import React from "react";
import { CreateOnigiriInput } from "../../models/Onigiri";
import { StarRating } from "./star-rating";
import { FormSection } from "./form-section";
import { ImageUploadField } from "./image-upload-field";
import { TweetImportSection } from "./tweet-import-section";

/**
 * おにぎり編集フォームのProps
 */
interface OnigiriFormProps {
  formData: CreateOnigiriInput;
  touched: Record<string, boolean>;
  isImageUploading: boolean;
  imageUploadError: string;
  showImageUrlInput: boolean;
  showEatImageUrlInput: boolean;
  tweetImportKey: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onRatingChange: (value: number) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>, fieldName: "imageUrl" | "eatImageUrl") => void;
  onToggleImageUrlInput: () => void;
  onToggleEatImageUrlInput: () => void;
  onTweetTextFetched: (data: { text: string; parsed: { name?: string; storeName?: string; price?: number } }) => void;
  onTweetImagesUploaded: (imageUrl: string, eatImageUrl: string) => void;
  onTweetUploadingChange: (isUploading: boolean) => void;
}

/**
 * おにぎり編集フォームコンポーネント
 * Xインポート・基本情報・写真・メモの各セクションを組み立てます
 */
export function OnigiriForm({
  formData,
  touched,
  isImageUploading,
  imageUploadError,
  showImageUrlInput,
  showEatImageUrlInput,
  tweetImportKey,
  onChange,
  onBlur,
  onRatingChange,
  onImageUpload,
  onToggleImageUrlInput,
  onToggleEatImageUrlInput,
  onTweetTextFetched,
  onTweetImagesUploaded,
  onTweetUploadingChange,
}: OnigiriFormProps) {
  return (
    <form className="space-y-5 py-2">
      {/* セクション: Xからインポート */}
      <TweetImportSection
        key={tweetImportKey}
        onTextFetched={onTweetTextFetched}
        onImagesUploaded={onTweetImagesUploaded}
        onUploadingChange={onTweetUploadingChange}
      />

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
              onChange={onChange}
              onBlur={onBlur}
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
              onChange={onChange}
              onBlur={onBlur}
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
                onChange={onChange}
                onBlur={onBlur}
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
            <StarRating rating={formData.rating} onRatingChange={onRatingChange} />
          </div>
        </div>
      </FormSection>

      {/* セクション: 写真 */}
      <FormSection title="写真">
        <div className="grid grid-cols-2 gap-3">
          <ImageUploadField
            inputId="imageUpload"
            name="imageUrl"
            label="おにぎりの写真"
            value={formData.imageUrl}
            isUploading={isImageUploading}
            showUrlInput={showImageUrlInput}
            onToggleUrlInput={onToggleImageUrlInput}
            onFileSelect={(e) => onImageUpload(e, "imageUrl")}
            onUrlChange={onChange}
          />

          <ImageUploadField
            inputId="eatImageUpload"
            name="eatImageUrl"
            label="食べた時の写真"
            value={formData.eatImageUrl}
            isUploading={isImageUploading}
            showUrlInput={showEatImageUrlInput}
            onToggleUrlInput={onToggleEatImageUrlInput}
            onFileSelect={(e) => onImageUpload(e, "eatImageUrl")}
            onUrlChange={onChange}
          />
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
            onChange={onChange}
            className="w-full p-2 border border-input rounded-md bg-background text-foreground"
            placeholder="おにぎりの感想やメモを入力..."
          />
        </div>
      </FormSection>
    </form>
  );
}
