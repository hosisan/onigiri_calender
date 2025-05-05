import { supabase } from '@/app/utils/supabase';
import { NextRequest, NextResponse } from 'next/server';

// 特定のIDのおにぎりを取得するAPI
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('onigiri')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // データが見つからない場合のエラーコード
        return NextResponse.json({ error: '指定されたIDのおにぎりが見つかりません' }, { status: 404 });
      }
      
      console.error('データ取得エラー:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('予期せぬエラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

// 特定のIDのおにぎりを更新するAPI
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const updates = await request.json();

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

// 特定のIDのおにぎりを削除するAPI
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

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