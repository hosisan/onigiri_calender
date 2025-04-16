"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { Onigiri, OnigiriSearchParams } from "../../models/Onigiri";
import { Button } from "../ui/button";
import { formatDisplayDate } from "../../utils/date-utils";
import Image from "next/image";

/**
 * おにぎり検索コンポーネントのProps
 */
interface OnigiriSearchProps {
  onSearch: (params: OnigiriSearchParams) => void;
  onSelectOnigiri: (onigiri: Onigiri) => void;
  searchResults: Onigiri[];
}

/**
 * おにぎり検索コンポーネント
 * おにぎりを条件で検索します
 */
export function OnigiriSearch({ onSearch, onSelectOnigiri, searchResults }: OnigiriSearchProps) {
  const [searchParams, setSearchParams] = useState<OnigiriSearchParams>({
    name: "",
    storeName: "",
    minRating: undefined,
    minPrice: undefined,
    maxPrice: undefined
  });
  
  // 入力変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = name === 'minRating' || name === 'minPrice' || name === 'maxPrice'
      ? value === "" ? undefined : Number(value)
      : value;
    
    setSearchParams((prev) => ({
      ...prev,
      [name]: numValue
    }));
  };
  
  // 検索実行ハンドラ
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };
  
  // フォームリセットハンドラ
  const handleReset = () => {
    setSearchParams({
      name: "",
      storeName: "",
      minRating: undefined,
      minPrice: undefined,
      maxPrice: undefined
    });
    // 検索条件をリセットしたら全件表示
    onSearch({});
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              おにぎり名
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={searchParams.name || ""}
              onChange={handleChange}
              placeholder="例: 鮭おにぎり"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
              店舗名
            </label>
            <input
              type="text"
              id="storeName"
              name="storeName"
              value={searchParams.storeName || ""}
              onChange={handleChange}
              placeholder="例: ファミリーマート"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="minRating" className="block text-sm font-medium text-gray-700 mb-1">
              最低評価
            </label>
            <select
              id="minRating"
              name="minRating"
              value={searchParams.minRating || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
            >
              <option value="">指定なし</option>
              <option value="1">★ 以上</option>
              <option value="2">★★ 以上</option>
              <option value="3">★★★ 以上</option>
              <option value="4">★★★★ 以上</option>
              <option value="5">★★★★★</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">
              最低価格 (円)
            </label>
            <input
              type="number"
              id="minPrice"
              name="minPrice"
              value={searchParams.minPrice || ""}
              onChange={handleChange}
              placeholder="例: 100"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">
              最高価格 (円)
            </label>
            <input
              type="number"
              id="maxPrice"
              name="maxPrice"
              value={searchParams.maxPrice || ""}
              onChange={handleChange}
              placeholder="例: 300"
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button type="submit" className="flex items-center">
            <Search className="mr-2 h-4 w-4" />
            検索
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            リセット
          </Button>
        </div>
      </form>
      
      {/* 検索結果 */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-3">検索結果: {searchResults.length}件</h3>
        
        {searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map((onigiri) => {
              // 日付文字列からDateオブジェクトを作成
              const onigiriDate = new Date(onigiri.createdAt);
              
              return (
                <button
                  key={onigiri.id}
                  onClick={() => onSelectOnigiri(onigiri)}
                  className="w-full text-left p-3 border rounded-md hover:bg-gray-50 transition-colors flex justify-between items-start"
                >
                  <div className="flex gap-3">
                    {onigiri.imageUrl && (
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden shrink-0">
                        <Image
                          src={onigiri.imageUrl}
                          alt={onigiri.name}
                          width={64}
                          height={64}
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{onigiri.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {onigiri.storeName} / {onigiri.price}円 / 
                        <span className="text-yellow-500">
                          {"★".repeat(onigiri.rating)}
                        </span>
                        <span className="text-gray-300">
                          {"★".repeat(5 - onigiri.rating)}
                        </span>
                      </div>
                      {onigiri.memo && (
                        <div className="text-sm text-gray-500 mt-1 truncate max-w-md">
                          {onigiri.memo}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDisplayDate(onigiriDate)}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            検索条件に一致するおにぎりが見つかりませんでした。
          </div>
        )}
      </div>
    </div>
  );
} 