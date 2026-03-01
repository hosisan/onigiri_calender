"use client";

import { useState, useEffect, useRef } from "react";
import { CalendarGrid } from "./components/calendar/calendar-grid";
import { OnigiriDialog } from "./components/onigiri/onigiri-dialog";
import { OnigiriSearch } from "./components/onigiri/onigiri-search";
import { Onigiri, CreateOnigiriInput, OnigiriSearchParams } from "./models/Onigiri";
import { formatDateToString } from "./utils/date-utils";
import { v4 as uuidv4 } from "uuid";
import { OnigiriService } from "./services/onigiri-service";
import { Dialog, DialogContent } from "./components/ui/dialog";
import { toast } from "sonner";
import { cn } from "./lib/utils";

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
  const [lastSavedDate, setLastSavedDate] = useState<string | null>(null);

  // カレンダー部分のref
  const calendarRef = useRef<HTMLDivElement>(null);

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
    setSelectedOnigiri(undefined);
    setIsDialogOpen(true);

    try {
      // 選択した日付のおにぎりデータを取得
      const dateString = formatDateToString(date);
      const onigiriList = await OnigiriService.getByDate(dateString);

      if (onigiriList.length > 0) {
        // おにぎりが登録されている場合は最初のおにぎりを選択
        setSelectedOnigiri(onigiriList[0]);
      }
    } catch (error) {
      console.error("日付選択時のデータ取得に失敗しました:", error);
    }
  };

  // 月の移動処理
  const handleNavigateMonth = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    setLastSavedDate(null);
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

      // セル保存アニメーション用
      setLastSavedDate(dateString);

      // 成功トースト表示
      toast.success("おにぎりを記録しました 🍙");

      // ダイアログを閉じる
      setIsDialogOpen(false);
    } catch (error) {
      console.error("おにぎりの保存に失敗しました:", error);
      toast.error("おにぎりの保存に失敗しました。もう一度お試しください。");
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
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4 text-foreground">🍙 おにぎりカレンダー</h1>

        <div className="flex justify-center mb-4">
          <div className="relative inline-flex rounded-lg bg-muted p-1" role="tablist">
            {/* スライドインジケーター */}
            <div
              className={cn(
                "absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-orange-500 shadow-sm transition-transform duration-300 ease-in-out",
                viewMode === "calendar" ? "translate-x-0 left-1" : "translate-x-full left-1"
              )}
              aria-hidden="true"
            />
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "calendar"}
              onClick={() => setViewMode("calendar")}
              className={cn(
                "relative z-10 px-6 py-2 text-sm font-medium rounded-md transition-colors duration-300",
                viewMode === "calendar"
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              カレンダー
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === "search"}
              onClick={() => setViewMode("search")}
              className={cn(
                "relative z-10 px-6 py-2 text-sm font-medium rounded-md transition-colors duration-300",
                viewMode === "search"
                  ? "text-white"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              検索
            </button>
          </div>
        </div>
      </header>

      <main>
        {isLoading ? (
          <div className="w-full max-w-4xl mx-auto">
            {/* スケルトン: ヘッダー */}
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-md bg-muted animate-pulse" />
              <div className="w-32 h-7 rounded-md bg-muted animate-pulse" />
              <div className="w-12 h-12 rounded-md bg-muted animate-pulse" />
            </div>

            {/* スケルトン: 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="text-center p-1 sm:p-2">
                  <div className="w-6 h-4 mx-auto rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>

            {/* スケルトン: カレンダーグリッド */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 sm:h-36 p-1 sm:p-2 border border-border rounded-lg bg-card animate-pulse"
                >
                  <div className="w-5 h-4 rounded bg-muted" />
                </div>
              ))}
            </div>
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
                lastSavedDate={lastSavedDate}
                onSaveAnimationEnd={() => setLastSavedDate(null)}
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

      {/* オーバーレイダイアログ */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) setIsDialogOpen(false); }}>
        <DialogContent>
          {selectedDate && (
            <OnigiriDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              date={selectedDate}
              onigiri={selectedOnigiri}
              onSave={(date, formData) => {
                handleSaveOnigiri(date, formData);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
