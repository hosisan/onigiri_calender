import { supabase } from '@/app/utils/supabase';
import { NextRequest, NextResponse } from 'next/server';

// 特定の日付のおにぎりを取得するAPI
export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const date = params.date;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: '正しい日付形式（YYYY-MM-DD）で指定してください' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('onigiri')
      .select('*')
      .eq('date', date)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('データ取得エラー:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 