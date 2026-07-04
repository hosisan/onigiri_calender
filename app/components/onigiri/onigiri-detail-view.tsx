"use client";

import React from "react";
import Image from "next/image";
import { Onigiri } from "../../models/Onigiri";
import { StarRating } from "./star-rating";

/**
 * おにぎり詳細表示のProps
 */
interface OnigiriDetailViewProps {
  onigiri: Onigiri;
}

/**
 * おにぎり詳細表示コンポーネント（閲覧モード）
 * ヒーロー画像・情報カード・写真比較・メモを表示します
 */
export function OnigiriDetailView({ onigiri }: OnigiriDetailViewProps) {
  return (
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
  );
}
