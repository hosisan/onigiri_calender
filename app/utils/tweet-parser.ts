/**
 * Xポストのテキスト解析ユーティリティ
 *
 * ユーザーの投稿フォーマット:
 *   1行目: 店舗名（絵文字が含まれる場合あり）
 *   2行目: 商品名 + 価格（価格がない場合は0円）
 */

export interface ParsedTweetData {
  name: string | null;
  storeName: string | null;
  price: number;
}

/**
 * テキストから絵文字を除去する
 */
function removeEmojis(text: string): string {
  return text
    .replace(
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B05}-\u{2B07}\u{2934}-\u{2935}\u{3030}\u{FE0F}\u{200D}\u{20E3}\u{23CF}\u{23E9}-\u{23F3}\u{23F8}-\u{23FA}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2602}-\u{2605}\u{2607}-\u{260D}\u{260F}-\u{2612}\u{2614}-\u{2615}\u{2618}\u{261D}\u{2620}\u{2622}-\u{2623}\u{2626}\u{262A}\u{262E}-\u{262F}\u{2638}-\u{263A}\u{2640}\u{2642}\u{2648}-\u{2653}\u{265F}-\u{2660}\u{2663}\u{2665}-\u{2666}\u{2668}\u{267B}\u{267E}-\u{267F}\u{2692}-\u{2697}\u{2699}\u{269B}-\u{269C}\u{26A0}-\u{26A1}\u{26A7}\u{26AA}-\u{26AB}\u{26B0}-\u{26B1}\u{26BD}-\u{26BE}\u{26C4}-\u{26C5}\u{26C8}\u{26CE}-\u{26CF}\u{26D1}\u{26D3}-\u{26D4}\u{26E9}-\u{26EA}\u{26F0}-\u{26F5}\u{26F7}-\u{26FA}\u{26FD}\u{2702}\u{2705}\u{2708}-\u{270D}\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}-\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2755}\u{2757}\u{2763}-\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{E0020}-\u{E007F}]/gu,
      ""
    )
    .trim();
}

/**
 * XポストURLからツイートIDを抽出する
 */
export function extractTweetId(url: string): string | null {
  const match = url.match(
    /(?:https?:\/\/)?(?:(?:mobile\.)?twitter\.com|x\.com)\/\w+\/status\/(\d+)/
  );
  return match ? match[1] : null;
}

/**
 * テキストから価格を抽出する（なければ0）
 */
function extractPrice(text: string): number {
  const match = text.match(/(\d+)円/) || text.match(/¥(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * テキストから商品名を抽出する（価格部分を除去）
 */
function extractName(text: string): string | null {
  const cleaned = text
    .replace(/\d+円/, "")
    .replace(/¥\d+/, "")
    .replace(/#\S+/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .trim();
  return cleaned || null;
}

/**
 * 店舗名の略称を正式名称に変換する
 */
const STORE_NAME_MAP: { pattern: RegExp; official: string }[] = [
  { pattern: /^セブン$/, official: "セブンイレブン" },
  { pattern: /^ファミマ$/, official: "ファミリーマート" },
];

function normalizeStoreName(name: string): string {
  for (const { pattern, official } of STORE_NAME_MAP) {
    if (pattern.test(name)) return official;
  }
  return name;
}

/**
 * ツイートテキストからおにぎり情報を解析する
 */
export function parseTweetForOnigiri(text: string): ParsedTweetData {
  const lines = text.split("\n").filter((l) => l.trim());

  // 1行目: 店舗名（絵文字除去 → 略称を正式名称に変換）
  const rawStoreName = lines.length >= 1 ? removeEmojis(lines[0]) || null : null;
  const storeName = rawStoreName ? normalizeStoreName(rawStoreName) : null;

  // 2行目: 商品名 + 価格
  let name: string | null = null;
  let price = 0;
  if (lines.length >= 2) {
    price = extractPrice(lines[1]);
    name = extractName(lines[1]);
  }

  return { name, storeName, price };
}
