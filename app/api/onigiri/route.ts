import { supabase } from '@/app/utils/supabase';
import { NextRequest, NextResponse } from 'next/server';

// おにぎりの一覧を取得するAPI
export async function GET(request: NextRequest) {
  try {
    // URLパラメータから日付やその他のフィルター条件を取得
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const name = searchParams.get('name');
    const storeName = searchParams.get('storeName');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');

    // 基本のクエリを構築
    let query = supabase.from('onigiri').select('*');

    // フィルター条件を追加
    if (date) query = query.eq('date', date);
    if (name) query = query.ilike('name', `%${name}%`);
    if (storeName) query = query.ilike('storeName', `%${storeName}%`);
    if (minRating) query = query.gte('rating', minRating);
    if (maxRating) query = query.lte('rating', maxRating);

    // 作成日時の降順でソート
    query = query.order('createdAt', { ascending: false });

    // クエリを実行
    const { data, error } = await query;

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

// 新しいおにぎりを登録するAPI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 必須フィールドの検証
    const { date, name, storeName, price, rating } = body;
    if (!date || !name || !storeName || price === undefined || rating === undefined) {
      return NextResponse.json(
        { error: '必須フィールドが不足しています（date, name, storeName, price, rating）' },
        { status: 400 }
      );
    }

    // データ登録
    const { data, error } = await supabase
      .from('onigiri')
      .insert([body])
      .select();

    if (error) {
      console.error('データ登録エラー:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 特定のおにぎりを更新するAPI
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('onigiri')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      console.error('データ更新エラー:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data.length === 0) {
      return NextResponse.json({ error: '指定されたIDのおにぎりが見つかりません' }, { status: 404 });
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 特定のおにぎりを削除するAPI
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    const { error } = await supabase
      .from('onigiri')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('データ削除エラー:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
} 