"use client";

import React from "react";

interface RatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
}

export function Rating({ rating, onRatingChange }: RatingProps) {
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