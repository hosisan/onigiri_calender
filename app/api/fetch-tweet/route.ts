import { NextRequest, NextResponse } from "next/server";
import { extractTweetId, parseTweetForOnigiri } from "@/app/utils/tweet-parser";

// Xポストからデータを取得するAPI
export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "URLが必要です" },
        { status: 400 }
      );
    }

    // URL検証・ツイートID抽出
    const tweetId = extractTweetId(url);
    if (!tweetId) {
      return NextResponse.json(
        { error: "有効なXのポストURLを入力してください" },
        { status: 400 }
      );
    }

    // FxTwitter APIからツイートデータ取得
    const resp = await fetch(
      `https://api.fxtwitter.com/i/status/${tweetId}`,
      { next: { revalidate: 0 } }
    );

    if (!resp.ok) {
      return NextResponse.json(
        { error: "ポストのデータを取得できませんでした" },
        { status: 502 }
      );
    }

    const data = await resp.json();

    if (data.code !== 200 || !data.tweet) {
      return NextResponse.json(
        { error: "ポストが見つかりませんでした" },
        { status: 404 }
      );
    }

    // 画像URL抽出
    const images: string[] =
      data.tweet.media?.photos?.map((p: { url: string }) => p.url) ?? [];

    // テキスト解析
    const parsed = parseTweetForOnigiri(data.tweet.text);

    return NextResponse.json({
      text: data.tweet.text,
      images,
      parsed,
    });
  } catch (error) {
    console.error("ツイート取得エラー:", error);
    return NextResponse.json(
      { error: "通信エラーが発生しました" },
      { status: 500 }
    );
  }
}
