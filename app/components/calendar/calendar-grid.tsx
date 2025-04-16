"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  formatDateToString, 
  formatDisplayDate, 
  formatMonth,
  getCalendarDays, 
  isCurrentMonth 
} from "../../utils/date-utils";
import { Onigiri } from "../../models/Onigiri";
import { Button } from "../ui/button";
import Image from "next/image";

/**
 * カレンダーグリッドコンポーネントのProps
 */
interface CalendarGridProps {
  year: number;
  month: number;
  onigiriData: Record<string, Onigiri[]>;
  onDateSelect: (date: Date) => void;
  onNavigateMonth: (year: number, month: number) => void;
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
  onNavigateMonth 
}: CalendarGridProps) {
  // カレンダーに表示する日付の配列
  const calendarDays = getCalendarDays(year, month);
  
  // 現在の月の1日
  const currentMonthDate = new Date(year, month - 1, 1);
  
  // 前月へ移動
  const handlePrevMonth = () => {
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    onNavigateMonth(prevYear, prevMonth);
  };
  
  // 次月へ移動
  const handleNextMonth = () => {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    onNavigateMonth(nextYear, nextMonth);
  };
  
  // 日付クリック時の処理
  const handleDateClick = (date: Date) => {
    // 日付を選択
    onDateSelect(date);
  };
  
  // 曜日ヘッダー
  const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* カレンダーヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handlePrevMonth}
          aria-label="前月へ"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <h2 className="text-xl font-bold">
          {formatMonth(currentMonthDate)}
        </h2>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleNextMonth}
          aria-label="次月へ"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdays.map((day, index) => (
          <div 
            key={index} 
            className={`text-center p-2 font-medium ${
              index === 0 ? "text-red-500" : 
              index === 6 ? "text-blue-500" : ""
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
          const onigiriCount = onigiriData[dateString]?.length || 0;
          const isCurrentMonthDay = isCurrentMonth(date, currentMonthDate);
          
          // 日曜日は赤、土曜日は青にする
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isHoliday = date.getDay() === 0;
          
          return (
            <button
              key={index}
              className={`relative h-32 p-2 border rounded-lg transition-colors flex flex-col items-start justify-start ${
                isCurrentMonthDay 
                  ? "bg-white hover:bg-gray-50" 
                  : "bg-gray-100 text-gray-400"
              } ${isHoliday ? "text-red-500" : date.getDay() === 6 ? "text-blue-500" : ""}`}
              onClick={() => handleDateClick(date)}
              type="button"
            >
              <span className="text-sm font-medium">
                {date.getDate()}
              </span>
              
              {/* おにぎりインジケーター */}
              {hasOnigiri && (
                <div className="absolute top-2 right-2 flex items-center">
                  <span className="text-xs bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full">
                    <span className="inline-block w-2 h-2 bg-orange-500 rounded-full"></span>
                  </span>
                </div>
              )}
              
              {/* おにぎりのサンプル表示（最大1件） */}
              {hasOnigiri && (
                <div className="mt-1 w-full overflow-hidden">
                  {onigiriData[dateString].slice(0, 1).map((onigiri) => (
                    <div 
                      key={onigiri.id} 
                      className="text-xs bg-orange-50 p-1 rounded"
                      title={onigiri.name}
                    >
                      <div className="truncate mb-0.5">{onigiri.name}</div>
                      {onigiri.imageUrl && (
                        <div className="w-full h-16 rounded-sm overflow-hidden">
                          <Image
                            src={onigiri.imageUrl}
                            alt={onigiri.name}
                            width={64}
                            height={64}
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 