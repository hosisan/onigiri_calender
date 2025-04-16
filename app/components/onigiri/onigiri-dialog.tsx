"use client";

import React, { useState, useEffect, useRef } from "react";
import { Onigiri, CreateOnigiriInput } from "../../models/Onigiri";
import { formatDisplayDate } from "../../utils/date-utils";
import { Button } from "../ui/button";
import Image from "next/image";

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
  
  // Props変更時の処理
  useEffect(() => {
    // 日付が変わった場合、編集モードかどうかを再設定
    // onigiriがundefinedなら登録画面、存在すれば詳細画面
    setIsEditing(!onigiri);
    
    // フォームデータを更新
    setFormData({
      name: onigiri?.name || "",
      storeName: onigiri?.storeName || "",
      price: onigiri?.price || 0,
      imageUrl: onigiri?.imageUrl || "",
      eatImageUrl: onigiri?.eatImageUrl || "",
      rating: onigiri?.rating || 3,
      memo: onigiri?.memo || ""
    });
    
    isFirstRender.current = false;
  }, [date, onigiri, isOpen]);
  
  // フォーム状態
  const [formData, setFormData] = useState<CreateOnigiriInput>({
    name: onigiri?.name || "",
    storeName: onigiri?.storeName || "",
    price: onigiri?.price || 0,
    imageUrl: onigiri?.imageUrl || "",
    eatImageUrl: onigiri?.eatImageUrl || "",
    rating: onigiri?.rating || 3,
    memo: onigiri?.memo || ""
  });

  // フォーム入力の変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" ? parseInt(value, 10) || 0 : value
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
    onSave(date, formData);
    setIsEditing(false);
    onClose();
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
        price: onigiri?.price || 0,
        imageUrl: onigiri?.imageUrl || "",
        eatImageUrl: onigiri?.eatImageUrl || "",
        rating: onigiri?.rating || 3,
        memo: onigiri?.memo || ""
      });
    }
    setIsEditing(!isEditing);
  };

  // モーダルスタイルのダイアログとして実装
  return (
    <div className="w-full bg-white">
      <div className="flex justify-between items-center p-4 border-b bg-white">
        <div>
          <h2 className="text-xl font-bold">
            {isEditing 
              ? `${formatDisplayDate(date)}のおにぎりを${onigiri ? '編集' : '登録'}`
              : `${formatDisplayDate(date)}のおにぎり`}
          </h2>
          {!isEditing && onigiri && (
            <p className="text-sm text-gray-500">
              {onigiri.name} - {onigiri.storeName}
            </p>
          )}
        </div>
        <button 
          onClick={onClose}
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="閉じる"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <div className="p-4 max-h-[calc(100vh-8rem)] overflow-y-auto bg-white">
        {isEditing ? (
          // 編集フォーム
          <form className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  おにぎり名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="storeName"
                  name="storeName"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  価格 (円) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  評価
                </label>
                <StarRating rating={formData.rating} onRatingChange={handleRatingChange} />
              </div>
              
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  おにぎりの写真URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="/images/onigiri-sample-1.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">プレビュー:</p>
                    <div className="rounded-md overflow-hidden">
                      <div className="relative h-24 w-full">
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
                <label htmlFor="eatImageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  食べた時の写真URL
                </label>
                <input
                  type="text"
                  id="eatImageUrl"
                  name="eatImageUrl"
                  value={formData.eatImageUrl || ""}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="/images/onigiri-eat-2.jpg"
                />
                {formData.eatImageUrl && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">プレビュー:</p>
                    <div className="rounded-md overflow-hidden">
                      <div className="relative h-24 w-full">
                        <Image
                          src={formData.eatImageUrl}
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
            </div>
            
            <div>
              <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
                メモ
              </label>
              <textarea
                id="memo"
                name="memo"
                rows={3}
                value={formData.memo || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </form>
        ) : onigiri ? (
          // 詳細表示
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">おにぎり名</h3>
                <p className="mt-1 text-sm">{onigiri.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">店舗名</h3>
                <p className="mt-1 text-sm">{onigiri.storeName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">価格</h3>
                <p className="mt-1 text-sm">{onigiri.price}円</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">評価</h3>
                <div className="mt-1">
                  <StarRating rating={onigiri.rating} />
                </div>
              </div>
            </div>
            
            {/* 画像表示 */}
            {(onigiri.imageUrl || onigiri.eatImageUrl) && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {onigiri.imageUrl && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">おにぎりの写真</h3>
                    <div className="rounded-md overflow-hidden">
                      <div className="relative w-full" style={{ maxWidth: '500px', height: '300px', maxHeight: '500px' }}>
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
                    <h3 className="text-sm font-medium text-gray-500 mb-2">食べた時の写真</h3>
                    <div className="rounded-md overflow-hidden">
                      <div className="relative w-full" style={{ maxWidth: '500px', height: '300px', maxHeight: '500px' }}>
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
                <h3 className="text-sm font-medium text-gray-500">メモ</h3>
                <p className="mt-1 text-sm whitespace-pre-line">{onigiri.memo}</p>
              </div>
            )}
          </div>
        ) : null}
      </div>
      
      <div className="p-4 border-t flex justify-end space-x-2 bg-white">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={toggleEditMode}>
              キャンセル
            </Button>
            <Button onClick={handleSave} disabled={!formData.name || !formData.storeName}>
              保存
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={onClose}>
              閉じる
            </Button>
            {onigiri && (
              <Button onClick={toggleEditMode}>
                編集
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
} 