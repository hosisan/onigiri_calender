"use client";

/**
 * 星評価コンポーネント
 */
export function StarRating({ rating, onRatingChange }: { rating: number; onRatingChange?: (value: number) => void }) {
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
