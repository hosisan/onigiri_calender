"use client";

import React, { useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  formatDateToString,
  formatDisplayDate,
  formatMonth,
  getCalendarDays,
  isCurrentMonth,
  isCurrentYearMonth
} from "../../utils/date-utils";
import { Onigiri } from "../../models/Onigiri";
import { Button } from "../ui/button";
import Image from "next/image";
import { cn } from "../../lib/utils";

/**
 * カレンダーグリッドコンポーネントのProps
 */
interface CalendarGridProps {
  year: number;
  month: number;
  onigiriData: Record<string, Onigiri[]>;
  onDateSelect: (date: Date) => void;
  onNavigateMonth: (year: number, month: number) => void;
  lastSavedDate?: string | null;
  onSaveAnimationEnd?: () => void;
}

/**
 * カレンダーグリッドコンポーネント
 * 月単位のカレンダーを表示します
 */
export function CalendarGrid({
  year,
  month,
  onigiriData,
  onDateSelect,
  onNavigateMonth,
  lastSavedDate,
  onSaveAnimationEnd
}: CalendarGridProps) {
  // カレンダーに表示する日付の配列
  const calendarDays = getCalendarDays(year, month);

  // 現在の月の1日
  const currentMonthDate = new Date(year, month - 1, 1);

  // 前月へ移動
  const handlePrevMonth = useCallback(() => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    onNavigateMonth(prevYear, prevMonth);
  }, [month, year, onNavigateMonth]);

  // 次月へ移動
  const handleNextMonth = useCallback(() => {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    onNavigateMonth(nextYear, nextMonth);
  }, [month, year, onNavigateMonth]);

  // スワイプ検出用のref
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const SWIPE_THRESHOLD = 50;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // 水平方向の移動が垂直方向より大きい場合のみスワイプと判定
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNextMonth();
      } else {
        handlePrevMonth();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }, [handlePrevMonth, handleNextMonth]);

  // 今月に移動
  const handleGoToday = () => {
    const now = new Date();
    onNavigateMonth(now.getFullYear(), now.getMonth() + 1);
  };

  // 今月を表示中かどうか
  const isViewingCurrentMonth = isCurrentYearMonth(year, month);

  // 日付クリック時の処理
  const handleDateClick = (date: Date) => {
    // 日付を選択
    onDateSelect(date);
  };

  // 曜日ヘッダー
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div
      className="w-full max-w-4xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12"
          onClick={handlePrevMonth}
          aria-label="前月へ"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">
            {formatMonth(currentMonthDate)}
          </h2>
          {!isViewingCurrentMonth && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGoToday}
              aria-label="今月に戻る"
              className="text-xs"
            >
              今日
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12"
          onClick={handleNextMonth}
          aria-label="次月へ"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((day, index) => (
          <div
            key={index}
            className={`text-center p-1 sm:p-2 text-xs sm:text-base font-medium ${
              index === 0 ? "text-red-500" :
              index === 6 ? "text-blue-500" : "text-foreground"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date, index) => {
          const dateString = formatDateToString(date);
          const hasOnigiri = !!onigiriData[dateString]?.length;
          const firstOnigiri = onigiriData[dateString]?.[0];
          const isCurrentMonthDay = isCurrentMonth(date, currentMonthDate);
          const isHoliday = date.getDay() === 0;
          const hasImage = hasOnigiri && !!firstOnigiri?.imageUrl;

          return (
            <button
              key={index}
              className={cn(
                "relative h-24 sm:h-36 p-1 sm:p-2 border border-border rounded-lg transition-colors overflow-hidden",
                isCurrentMonthDay
                  ? "bg-card hover:bg-muted"
                  : "bg-muted/50 text-muted-foreground",
                isHoliday ? "text-red-500" : date.getDay() === 6 ? "text-blue-500" : "",
                dateString === lastSavedDate && "animate-cell-saved"
              )}
              onClick={() => handleDateClick(date)}
              onAnimationEnd={() => {
                if (dateString === lastSavedDate && onSaveAnimationEnd) {
                  onSaveAnimationEnd();
                }
              }}
              type="button"
            >
              {/* おにぎり画像がある場合: 画像をセル背景として表示 */}
              {hasImage && (
                <>
                  <Image
                    src={firstOnigiri.imageUrl!}
                    alt={firstOnigiri.name}
                    fill
                    sizes="(max-width: 640px) 14vw, 128px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
                </>
              )}

              {/* 日付番号 */}
              <span
                className={cn(
                  "relative z-10 text-xs sm:text-sm font-medium",
                  hasImage && "text-white drop-shadow-md"
                )}
              >
                {date.getDate()}
              </span>

              {/* おにぎりインジケーター（画像なしの場合のみドット表示） */}
              {hasOnigiri && !hasImage && (
                <div className="absolute top-1 sm:top-2 right-1 sm:right-2">
                  <span className="inline-block w-2.5 h-2.5 bg-orange-500 rounded-full" />
                </div>
              )}

              {/* おにぎり名（セル下部に表示） */}
              {hasOnigiri && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 px-1 pb-0.5 sm:pb-1",
                    hasImage && "z-10"
                  )}
                >
                  <span
                    className={cn(
                      "block truncate text-[10px] sm:text-xs font-medium",
                      hasImage
                        ? "text-white drop-shadow-md"
                        : "text-foreground"
                    )}
                  >
                    {firstOnigiri?.name}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 空状態: 当月におにぎり未登録の場合 */}
      {!calendarDays.some((date) => {
        if (!isCurrentMonth(date, currentMonthDate)) return false;
        const dateStr = formatDateToString(date);
        return !!onigiriData[dateStr]?.length;
      }) && (
        <div className="text-center py-8 mt-4">
          <p className="text-4xl mb-3">🍙</p>
          <p className="text-muted-foreground text-sm">
            日付をタップしておにぎりを記録しましょう
          </p>
        </div>
      )}
    </div>
  );
}
