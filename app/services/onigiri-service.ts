import { supabase } from '@/app/utils/supabase';
import { Onigiri } from '@/app/models/Onigiri';

// おにぎりデータの取得サービス
export const OnigiriService = {
  // すべてのおにぎりを取得
  async getAll(): Promise<Onigiri[]> {
    const { data, error } = await supabase
      .from('onigiri')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('すべてのおにぎり取得エラー:', error);
      throw error;
    }

    return data as Onigiri[];
  },

  // 特定の日付のおにぎりを取得
  async getByDate(date: string): Promise<Onigiri[]> {
    if (!date) throw new Error('日付は必須です');

    const { data, error } = await supabase
      .from('onigiri')
      .select('*')
      .eq('date', date)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error(`日付：${date} のおにぎり取得エラー:`, error);
      throw error;
    }

    return data as Onigiri[];
  },

  // 特定の月のおにぎりを取得
  async getByMonth(year: number, month: number): Promise<Onigiri[]> {
    // 日付範囲の作成（月の初日と最終日）
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('onigiri')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error(`${year}年${month}月のおにぎり取得エラー:`, error);
      throw error;
    }

    return data as Onigiri[];
  },

  // 特定のIDのおにぎりを取得
  async getById(id: string): Promise<Onigiri | null> {
    if (!id) throw new Error('IDは必須です');

    const { data, error } = await supabase
      .from('onigiri')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // データが見つからない場合
        return null;
      }
      console.error(`ID：${id} のおにぎり取得エラー:`, error);
      throw error;
    }

    return data as Onigiri;
  },

  // 新しいおにぎりを作成
  async create(onigiri: Omit<Onigiri, 'id' | 'createdAt' | 'updatedAt'>): Promise<Onigiri> {
    const { data, error } = await supabase
      .from('onigiri')
      .insert([onigiri])
      .select();

    if (error) {
      console.error('おにぎり作成エラー:', error);
      throw error;
    }

    return data[0] as Onigiri;
  },

  // おにぎりを更新
  async update(id: string, updates: Partial<Omit<Onigiri, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Onigiri> {
    if (!id) throw new Error('IDは必須です');

    const { data, error } = await supabase
      .from('onigiri')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error(`ID：${id} のおにぎり更新エラー:`, error);
      throw error;
    }

    if (data.length === 0) {
      throw new Error('指定されたIDのおにぎりが見つかりません');
    }

    return data[0] as Onigiri;
  },

  // おにぎりを削除
  async delete(id: string): Promise<void> {
    if (!id) throw new Error('IDは必須です');

    const { error } = await supabase
      .from('onigiri')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`ID：${id} のおにぎり削除エラー:`, error);
      throw error;
    }
  },

  // 検索条件でおにぎりを検索
  async search(params: {
    name?: string;
    storeName?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    maxRating?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Onigiri[]> {
    let query = supabase.from('onigiri').select('*');

    // フィルター条件の追加
    if (params.name) query = query.ilike('name', `%${params.name}%`);
    if (params.storeName) query = query.ilike('storeName', `%${params.storeName}%`);
    if (params.minPrice) query = query.gte('price', params.minPrice);
    if (params.maxPrice) query = query.lte('price', params.maxPrice);
    if (params.minRating) query = query.gte('rating', params.minRating);
    if (params.maxRating) query = query.lte('rating', params.maxRating);
    if (params.dateFrom) query = query.gte('date', params.dateFrom);
    if (params.dateTo) query = query.lte('date', params.dateTo);

    const { data, error } = await query.order('createdAt', { ascending: false });

    if (error) {
      console.error('おにぎり検索エラー:', error);
      throw error;
    }

    return data as Onigiri[];
  }
}; 