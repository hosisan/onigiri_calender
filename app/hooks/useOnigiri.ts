import { useState, useCallback } from 'react';
import { OnigiriService } from '@/app/services/onigiri-service';
import { Onigiri, CreateOnigiriInput } from '@/app/models/Onigiri';

export const useOnigiri = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [onigiriList, setOnigiriList] = useState<Onigiri[]>([]);
  const [currentOnigiri, setCurrentOnigiri] = useState<Onigiri | null>(null);

  // エラーハンドリング
  const handleError = useCallback((error: any) => {
    console.error('おにぎり操作エラー:', error);
    setError(error instanceof Error ? error : new Error(String(error)));
    setLoading(false);
  }, []);

  // すべてのおにぎりを取得
  const fetchAllOnigiri = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await OnigiriService.getAll();
      setOnigiriList(data);
      return data;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 特定の日付のおにぎりを取得
  const fetchOnigiriByDate = useCallback(async (date: string) => {
    if (!date) return [];
    
    setLoading(true);
    setError(null);
    try {
      const data = await OnigiriService.getByDate(date);
      setOnigiriList(data);
      return data;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 特定の月のおにぎりを取得
  const fetchOnigiriByMonth = useCallback(async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await OnigiriService.getByMonth(year, month);
      return data;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 特定のIDのおにぎりを取得
  const fetchOnigiriById = useCallback(async (id: string) => {
    if (!id) return null;
    
    setLoading(true);
    setError(null);
    try {
      const data = await OnigiriService.getById(id);
      setCurrentOnigiri(data);
      return data;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // 新しいおにぎりを作成
  const createOnigiri = useCallback(async (onigiri: CreateOnigiriInput) => {
    setLoading(true);
    setError(null);
    try {
      const newOnigiri = await OnigiriService.create(onigiri);
      setOnigiriList(prev => [newOnigiri, ...prev]);
      setCurrentOnigiri(newOnigiri);
      return newOnigiri;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // おにぎりを更新
  const updateOnigiri = useCallback(async (id: string, updates: Partial<Omit<Onigiri, 'id' | 'createdAt' | 'updatedAt'>>) => {
    if (!id) return null;
    
    setLoading(true);
    setError(null);
    try {
      const updatedOnigiri = await OnigiriService.update(id, updates);
      
      // リストと現在のおにぎりを更新
      setOnigiriList(prev => 
        prev.map(item => item.id === id ? updatedOnigiri : item)
      );
      
      if (currentOnigiri && currentOnigiri.id === id) {
        setCurrentOnigiri(updatedOnigiri);
      }
      
      return updatedOnigiri;
    } catch (err) {
      handleError(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentOnigiri, handleError]);

  // おにぎりを削除
  const deleteOnigiri = useCallback(async (id: string) => {
    if (!id) return false;
    
    setLoading(true);
    setError(null);
    try {
      await OnigiriService.delete(id);
      
      // リストから削除
      setOnigiriList(prev => prev.filter(item => item.id !== id));
      
      // 現在のおにぎりをクリア（選択中のものが削除された場合）
      if (currentOnigiri && currentOnigiri.id === id) {
        setCurrentOnigiri(null);
      }
      
      return true;
    } catch (err) {
      handleError(err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [currentOnigiri, handleError]);

  // おにぎりを検索
  const searchOnigiri = useCallback(async (params: {
    name?: string;
    storeName?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    maxRating?: number;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const results = await OnigiriService.search(params);
      setOnigiriList(results);
      return results;
    } catch (err) {
      handleError(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  return {
    loading,
    error,
    onigiriList,
    currentOnigiri,
    fetchAllOnigiri,
    fetchOnigiriByDate,
    fetchOnigiriByMonth,
    fetchOnigiriById,
    createOnigiri,
    updateOnigiri,
    deleteOnigiri,
    searchOnigiri,
    setCurrentOnigiri
  };
}; 