"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarGrid } from "./components/calendar/calendar-grid";
import { OnigiriDialog } from "./components/onigiri/onigiri-dialog";
import { OnigiriSearch } from "./components/onigiri/onigiri-search";
import { Onigiri, CreateOnigiriInput, OnigiriSearchParams } from "./models/Onigiri";
import { formatDateToString } from "./utils/date-utils";
import { 
  getAllOnigiri, 
  getOnigiriByMonth, 
  getOnigiriByDate,
  sampleOnigiriData,
  updateOnigiriData
} from "./data/onigiri-data";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  // 現在選択中の年月
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  
  // 選択した日付と表示モード
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"calendar" | "search">("calendar");
  
  // おにぎりデータ
  const [onigiriData, setOnigiriData] = useState<Record<string, Onigiri[]>>(sampleOnigiriData);
  const [selectedOnigiri, setSelectedOnigiri] = useState<Onigiri | undefined>(undefined);
  const [searchResults, setSearchResults] = useState<Onigiri[]>([]);
  
  // カレンダー部分のref
  const calendarRef = useRef<HTMLDivElement>(null);
  
  // 選択した月のおにぎりデータを取得
  const currentMonthOnigiri = getOnigiriByMonth(currentYear, currentMonth);
  
  // 初期データの修正: 各日付に1つだけおにぎりを残す
  useEffect(() => {
    // 初期データをチェックし、各日付に複数のおにぎりがある場合は最初のおにぎりのみを保持
    const fixedData = Object.entries(onigiriData).reduce<Record<string, Onigiri[]>>((acc, [date, onigiriList]) => {
      // 1つ目のおにぎりのみを保持
      acc[date] = onigiriList.length > 0 ? [onigiriList[0]] : [];
      return acc;
    }, {});
    
    // onigiriData が初期データと異なる場合のみ更新
    if (JSON.stringify(fixedData) !== JSON.stringify(onigiriData)) {
      setOnigiriData(fixedData);
      updateOnigiriData(fixedData);
    }
  }, []);
  
  // 日付選択時の処理
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    // 選択した日付のおにぎりデータを取得
    const dateString = formatDateToString(date);
    // onigiriDataから最新のデータを直接取得（サンプルデータではなく状態から）
    const onigiriList = onigiriData[dateString] || [];
    
    if (onigiriList.length > 0) {
      // おにぎりが登録されている場合は最初のおにぎりを選択
      setSelectedOnigiri(onigiriList[0]);
    } else {
      // おにぎりがない場合はundefinedをセット
      setSelectedOnigiri(undefined);
    }
    
    // ダイアログを開く
    setIsDialogOpen(true);
  };
  
  // 月の移動処理
  const handleNavigateMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };
  
  // おにぎり保存処理
  const handleSaveOnigiri = (date: Date, onigiriInput: CreateOnigiriInput) => {
    const dateString = formatDateToString(date);
    
    // 新しいおにぎりデータを作成
    const newOnigiri: Onigiri = {
      ...onigiriInput,
      id: selectedOnigiri?.id || uuidv4(),
      createdAt: selectedOnigiri?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // データを更新
    setOnigiriData((prevData) => {
      const newData = { ...prevData };
      
      // 各日付に1つのおにぎりしか登録できないようにする
      // 既存のIDと一致するものがあれば更新し、それ以外は新しいおにぎりで上書き
      newData[dateString] = [newOnigiri];
      
      // データアクセス関数と同期
      updateOnigiriData(newData);
      
      return newData;
    });
    
    // 保存後に選択中のおにぎりを更新
    setSelectedOnigiri(newOnigiri);
  };
  
  // 検索処理
  const handleSearch = (params: OnigiriSearchParams) => {
    const allOnigiri = getAllOnigiri();
    
    // 検索条件が空の場合は全件表示
    if (Object.values(params).every(v => v === undefined || v === "")) {
      setSearchResults(allOnigiri);
      return;
    }
    
    // 検索条件に一致するおにぎりをフィルタリング
    const filtered = allOnigiri.filter(onigiri => {
      const nameMatch = !params.name || onigiri.name.toLowerCase().includes(params.name.toLowerCase());
      const storeMatch = !params.storeName || onigiri.storeName.toLowerCase().includes(params.storeName.toLowerCase());
      const minPriceMatch = !params.minPrice || onigiri.price >= params.minPrice;
      const maxPriceMatch = !params.maxPrice || onigiri.price <= params.maxPrice;
      const ratingMatch = !params.minRating || onigiri.rating >= params.minRating;
      
      return nameMatch && storeMatch && minPriceMatch && maxPriceMatch && ratingMatch;
    });
    
    setSearchResults(filtered);
  };
  
  // 検索結果からおにぎりを選択
  const handleSelectSearchResult = (onigiri: Onigiri) => {
    setSelectedOnigiri(onigiri);
    
    // 日付を設定
    const date = new Date(onigiri.createdAt);
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
    setSearchResults(getAllOnigiri());
  }, [onigiriData]);

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
        <div ref={calendarRef} className={viewMode === "calendar" ? "" : "hidden"}>
          <CalendarGrid
            year={currentYear}
            month={currentMonth}
            onigiriData={currentMonthOnigiri}
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
      </main>
      
      {/* モーダルオーバーレイ - カレンダーの前面に表示 */}
      <div 
        className={`${isDialogOpen ? "fixed" : "hidden"} inset-0 z-[100] bg-white dark:bg-gray-900 flex items-center justify-center p-4`}
        style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      >
        {selectedDate && (
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden">
            <OnigiriDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              date={selectedDate}
              onigiri={selectedOnigiri}
              onSave={handleSaveOnigiri}
            />
          </div>
        )}
      </div>
    </div>
  );
}
