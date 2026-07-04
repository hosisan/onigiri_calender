"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Link } from "lucide-react";
import { extractTweetId } from "../../utils/tweet-parser";
import { downloadAndUploadImage } from "../../services/image-service";
import { FormSection } from "./form-section";

/**
 * Xポストの本文パース結果
 */
interface TweetParsedData {
  name?: string;
  storeName?: string;
  price?: number;
}

/**
 * XポストインポートセクションのProps
 */
interface TweetImportSectionProps {
  onTextFetched: (parsed: { text: string; parsed: TweetParsedData }) => void;
  onImagesUploaded: (imageUrl: string, eatImageUrl: string) => void;
  onUploadingChange: (isUploading: boolean) => void;
}

/**
 * Xポストからおにぎり情報をインポートするセクション
 * ポストURLの入力・取得・本文と画像の反映を担当します
 */
export function TweetImportSection({ onTextFetched, onImagesUploaded, onUploadingChange }: TweetImportSectionProps) {
  const [tweetUrl, setTweetUrl] = useState("");
  const [isFetchingTweet, setIsFetchingTweet] = useState(false);
  const [tweetFetchError, setTweetFetchError] = useState("");
  const [tweetFetchSuccess, setTweetFetchSuccess] = useState(false);

  // Xポストからデータを取得するハンドラ
  const handleFetchTweet = async (urlOverride?: string) => {
    const url = urlOverride || tweetUrl;
    if (!url.trim()) return;

    if (!extractTweetId(url)) {
      setTweetFetchError("有効なXのポストURLを入力してください");
      return;
    }

    setIsFetchingTweet(true);
    setTweetFetchError("");
    setTweetFetchSuccess(false);

    try {
      const response = await fetch("/api/fetch-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setTweetFetchError(errorData.error || "ポストのデータを取得できませんでした");
        return;
      }

      const data = await response.json();

      // テキストデータでフォームを更新（空フィールドのみ、マージはparent側で実施）
      onTextFetched({ text: data.text, parsed: data.parsed });

      // 画像をSupabaseにダウンロード・アップロード（2枚並行）
      if (data.images.length >= 2) {
        try {
          onUploadingChange(true);
          const [imagePublicUrl, eatImagePublicUrl] = await Promise.all([
            downloadAndUploadImage(data.images[0]),
            downloadAndUploadImage(data.images[1]),
          ]);
          onImagesUploaded(imagePublicUrl, eatImagePublicUrl);
        } catch (imgError) {
          console.warn("画像のダウンロードに失敗:", imgError);
        } finally {
          onUploadingChange(false);
        }
      }

      setTweetFetchSuccess(true);
      setTimeout(() => setTweetFetchSuccess(false), 3000);
    } catch {
      setTweetFetchError("通信エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsFetchingTweet(false);
    }
  };

  return (
    <FormSection title="Xからインポート">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={tweetUrl}
            onChange={(e) => {
              setTweetUrl(e.target.value);
              setTweetFetchError("");
            }}
            onPaste={(e) => {
              const pasted = e.clipboardData.getData("text");
              if (extractTweetId(pasted)) {
                e.preventDefault();
                setTweetUrl(pasted);
                setTimeout(() => handleFetchTweet(pasted), 0);
              }
            }}
            placeholder="https://x.com/user/status/..."
            className="w-full p-2 pl-8 border border-input rounded-md bg-background text-foreground text-sm"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleFetchTweet()}
          disabled={isFetchingTweet || !tweetUrl.trim()}
          className="px-3 py-1 whitespace-nowrap"
        >
          {isFetchingTweet ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-orange-500" />
          ) : (
            "取得"
          )}
        </Button>
      </div>
      {tweetFetchError && (
        <p className="text-xs text-red-500">{tweetFetchError}</p>
      )}
      {tweetFetchSuccess && (
        <p className="text-xs text-green-600">ポストからデータを取得しました</p>
      )}
    </FormSection>
  );
}
