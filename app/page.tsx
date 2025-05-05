"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarGrid } from "./components/calendar/calendar-grid";
import { OnigiriDialog } from "./components/onigiri/onigiri-dialog";
import { OnigiriSearch } from "./components/onigiri/onigiri-search";
import { Onigiri, CreateOnigiriInput, OnigiriSearchParams } from "./models/Onigiri";
import { formatDateToString } from "./utils/date-utils";
import { v4 as uuidv4 } from "uuid";
import { OnigiriService } from "./services/onigiri-service";

export default function Home() {
  // 現在選択中の年月
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  
  // 選択した日付と表示モード
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "search">("calendar");
  
  // おにぎりデータ
  const [onigiriData, setOnigiriData] = useState<Record<string, Onigiri[]>>({});
  const [selectedOnigiri, setSelectedOnigiri] = useState<Onigiri | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<Onigiri[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // カレンダー部分のref
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // ダークモード状態
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // ダークモード状態の検出
  useEffect(() => {
    // クライアントサイドでのみ実行
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeMediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // 初期データの読み込み
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const allOnigiri = await OnigiriService.getAll();
        
        // 日付ごとに整理
        const grouped = allOnigiri.reduce<Record<string, Onigiri[]>>((acc, onigiri) => {
          if (!acc[onigiri.date]) {
            acc[onigiri.date] = [];
          }
          acc[onigiri.date].push(onigiri);
          return acc;
        }, {});
        
        setOnigiriData(grouped);
        setIsLoading(false);
      } catch (error) {
        console.error("初期データの読み込みに失敗しました:", error);
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // 現在の月のおにぎりデータを取得
  useEffect(() => {
    const fetchMonthlyData = async () => {
      setIsLoading(true);
      try {
        const monthlyOnigiri = await OnigiriService.getByMonth(currentYear, currentMonth);
        
        // 日付ごとに整理
        const grouped = monthlyOnigiri.reduce<Record<string, Onigiri[]>>((acc, onigiri) => {
          if (!acc[onigiri.date]) {
            acc[onigiri.date] = [];
          }
          acc[onigiri.date].push(onigiri);
          return acc;
        }, {});
        
        // 既存のデータを更新せず、月ごとのデータをマージ
        setOnigiriData(prev => ({
          ...prev,
          ...grouped
        }));
        
        setIsLoading(false);
      } catch (error) {
        console.error(`${currentYear}年${currentMonth}月のデータ取得に失敗しました:`, error);
        setIsLoading(false);
      }
    };
    
    fetchMonthlyData();
  }, [currentYear, currentMonth]);
  
  // 日付選択時の処理
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    
    try {
      // 選択した日付のおにぎりデータを取得
      const dateString = formatDateToString(date);
      const onigiriList = await OnigiriService.getByDate(dateString);
      
      if (onigiriList.length > 0) {
        // おにぎりが登録されている場合は最初のおにぎりを選択
        setSelectedOnigiri(onigiriList[0]);
      } else {
        // おにぎりがない場合はundefinedをセット
        setSelectedOnigiri(undefined);
      }
      
      // ダイアログを開く
      setIsDialogOpen(true);
    } catch (error) {
      console.error("日付選択時のデータ取得に失敗しました:", error);
    }
  };
  
  // 月の移動処理
  const handleNavigateMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };
  
  // おにぎり保存処理
  const handleSaveOnigiri = async (date: Date, onigiriInput: CreateOnigiriInput) => {
    const dateString = formatDateToString(date);
    
    try {
      console.log('保存中のデータ:', onigiriInput);
      let savedOnigiri: Onigiri;
      
      if (selectedOnigiri?.id) {
        // 既存のおにぎりを更新
        savedOnigiri = await OnigiriService.update(selectedOnigiri.id, {
          ...onigiriInput,
          date: dateString
        });
        console.log('おにぎりを更新しました:', savedOnigiri);
      } else {
        // 新しいおにぎりを作成
        savedOnigiri = await OnigiriService.create({
          ...onigiriInput,
          date: dateString
        });
        console.log('新しいおにぎりを作成しました:', savedOnigiri);
      }
      
      // ローカルの状態を更新
      setOnigiriData(prevData => {
        const newData = { ...prevData };
        newData[dateString] = [savedOnigiri];
        return newData;
      });
      
      // 保存後に選択中のおにぎりを更新
      setSelectedOnigiri(savedOnigiri);
      
      // 検索結果も更新
      if (viewMode === "search") {
        handleSearch({});
      }
      
      // ダイアログを閉じる
      setIsDialogOpen(false);
    } catch (error) {
      console.error("おにぎりの保存に失敗しました:", error);
      alert("おにぎりの保存に失敗しました。もう一度お試しください。");
    }
  };
  
  // 検索処理
  const handleSearch = async (params: OnigiriSearchParams) => {
    try {
      const results = await OnigiriService.search(params);
      setSearchResults(results);
    } catch (error) {
      console.error("検索に失敗しました:", error);
    }
  };
  
  // 検索結果からおにぎりを選択
  const handleSelectSearchResult = async (onigiri: Onigiri) => {
    setSelectedOnigiri(onigiri);
    
    // 日付を設定
    const date = new Date(onigiri.date);
    setSelectedDate(date);
    
    // カレンダーモードに切り替えて該当月に移動
    setViewMode("calendar");
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth() + 1);
    
    // ダイアログを開く
    setIsDialogOpen(true);
  };
  
  // データが変更されたときに検索結果を更新
  useEffect(() => {
    if (viewMode === "search") {
      handleSearch({});
    }
  }, [onigiriData, viewMode]);

  return (
    <div className="container mx-auto py-8 px-4 dark:bg-gray-900">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4 dark:text-white">おにぎりカレンダー</h1>
        
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                viewMode === "calendar" 
                  ? "bg-orange-500 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              } border border-gray-200 dark:border-gray-700`}
            >
              カレンダー
            </button>
            <button
              type="button"
              onClick={() => setViewMode("search")}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                viewMode === "search" 
                  ? "bg-orange-500 text-white" 
                  : "bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              } border border-gray-200 dark:border-gray-700`}
            >
              検索
            </button>
          </div>
        </div>
      </header>

      <main>
        {isLoading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">データを読み込み中...</p>
          </div>
        ) : (
          <>
            <div ref={calendarRef} className={viewMode === "calendar" ? "" : "hidden"}>
              <CalendarGrid
                year={currentYear}
                month={currentMonth}
                onigiriData={onigiriData}
                onDateSelect={handleDateSelect}
                onNavigateMonth={handleNavigateMonth}
              />
            </div>
            
            {viewMode === "search" && (
              <OnigiriSearch
                onSearch={handleSearch}
                onSelectOnigiri={handleSelectSearchResult}
                searchResults={searchResults}
              />
            )}
          </>
        )}
      </main>
      
      {/* モーダルオーバーレイ - カレンダーの前面に表示（完全不透過） */}
      <div 
        className={`${isDialogOpen ? "fixed" : "hidden"} inset-0 z-[100] flex items-center justify-center p-4`}
        style={{ 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          backgroundColor: isDarkMode ? '#111827' : 'white',
          background: isDarkMode ? '#111827' : 'white'
        }}
      >
        {selectedDate && (
          <div 
            className="w-full max-w-3xl border rounded-lg shadow-md overflow-hidden" 
            style={{
              backgroundColor: isDarkMode ? '#1f2937' : 'white',
              background: isDarkMode ? '#1f2937' : 'white',
              borderColor: isDarkMode ? '#374151' : '#e5e7eb'
            }}
          >
            <OnigiriDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              date={selectedDate}
              onigiri={selectedOnigiri}
              onSave={(date, formData) => {
                handleSaveOnigiri(date, formData);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
