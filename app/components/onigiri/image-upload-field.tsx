"use client";

import React from "react";
import Image from "next/image";
import { Plus } from "lucide-react";

/**
 * 写真アップロードカードのProps
 */
interface ImageUploadFieldProps {
  inputId: string;
  name: string;
  label: string;
  value?: string;
  isUploading: boolean;
  showUrlInput: boolean;
  onToggleUrlInput: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * 写真アップロードカードコンポーネント
 * ファイル選択によるアップロードとURL直接入力の両方をサポートします
 */
export function ImageUploadField({
  inputId,
  name,
  label,
  value,
  isUploading,
  showUrlInput,
  onToggleUrlInput,
  onFileSelect,
  onUrlChange,
}: ImageUploadFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-foreground mb-1">
        {label}
      </label>
      <label
        htmlFor={inputId}
        className={`relative flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          value
            ? "border-solid border-border"
            : "border-input bg-muted/30 hover:bg-muted/50 hover:border-primary/50"
        }`}
      >
        <input
          type="file"
          id={inputId}
          accept="image/*"
          onChange={onFileSelect}
          className="hidden"
        />
        {value ? (
          <Image
            src={value}
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
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-card/80 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        )}
      </label>
      <button
        type="button"
        onClick={onToggleUrlInput}
        className="text-xs text-muted-foreground underline hover:text-foreground"
      >
        {showUrlInput ? "URL入力を閉じる" : "URLを直接入力する"}
      </button>
      {showUrlInput && (
        <input
          type="text"
          id={name}
          name={name}
          value={value || ""}
          onChange={onUrlChange}
          className="w-full p-2 border border-input rounded-md bg-background text-foreground text-xs"
          placeholder="https://example.com/image.jpg"
        />
      )}
    </div>
  );
}
