import { Onigiri } from "../models/Onigiri";

/**
 * サンプルおにぎりデータ
 * 初期データとして使用
 */
export const sampleOnigiriData: Record<string, Onigiri[]> = {
  // 日付ごとにおにぎりデータを管理
  // キーは "YYYY-MM-DD" 形式
  "2023-01-15": [
    {
      id: "1",
      name: "鮭おにぎり",
      storeName: "ファミリーマート",
      price: 150,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "朝食に食べました。塩加減が絶妙でした。",
      createdAt: "2023-01-15T08:30:00Z",
      updatedAt: "2023-01-15T08:30:00Z"
    }
  ],
  "2023-02-05": [
    {
      id: "2",
      name: "ツナマヨおにぎり",
      storeName: "セブンイレブン",
      price: 160,
      imageUrl: "/images/onigiri-sample-2.jpg",
      eatImageUrl: "/images/onigiri-eat-2.jpg",
      rating: 5,
      memo: "ツナの量が多くて満足感がありました。",
      createdAt: "2023-02-05T12:15:00Z",
      updatedAt: "2023-02-05T12:15:00Z"
    }
  ],
  "2023-02-06": [
    {
      id: "3",
      name: "昆布おにぎり",
      storeName: "セブンイレブン",
      price: 140,
      rating: 3,
      memo: "もう少し昆布の風味が欲しかった。",
      createdAt: "2023-02-06T12:20:00Z",
      updatedAt: "2023-02-06T12:20:00Z"
    }
  ],
  "2023-03-10": [
    {
      id: "4",
      name: "明太子おにぎり",
      storeName: "ローソン",
      price: 180,
      imageUrl: "/images/onigiri-sample-4.jpg",
      rating: 5,
      memo: "明太子の辛さが絶妙でした。また買いたい。",
      createdAt: "2023-03-10T18:45:00Z",
      updatedAt: "2023-03-10T18:45:00Z"
    }
  ],
  "2023-04-22": [
    {
      id: "5",
      name: "高菜おにぎり",
      storeName: "ファミリーマート",
      price: 150,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "高菜の味が効いていて美味しかった。",
      createdAt: "2023-04-22T13:30:00Z",
      updatedAt: "2023-04-22T13:30:00Z"
    }
  ],
  "2023-05-08": [
    {
      id: "6",
      name: "梅おにぎり",
      storeName: "セブンイレブン",
      price: 140,
      imageUrl: "/images/onigiri-sample-6.jpg",
      rating: 3,
      memo: "梅の酸味が強すぎた。",
      createdAt: "2023-05-08T10:20:00Z",
      updatedAt: "2023-05-08T10:20:00Z"
    }
  ],
  // 2025年3月のサンプルデータ
  "2025-03-01": [
    {
      id: "2025-03-01-1",
      name: "鮭おにぎり",
      storeName: "ファミリーマート",
      price: 150,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "朝食に食べました。塩加減が絶妙でした。",
      createdAt: "2025-03-01T08:30:00Z",
      updatedAt: "2025-03-01T08:30:00Z"
    }
  ],
  "2025-03-02": [
    {
      id: "2025-03-02-1",
      name: "ツナマヨおにぎり",
      storeName: "セブンイレブン",
      price: 160,
      imageUrl: "/images/onigiri-sample-2.jpg",
      eatImageUrl: "/images/onigiri-eat-2.jpg",
      rating: 5,
      memo: "ツナの量が多くて満足感がありました。",
      createdAt: "2025-03-02T12:15:00Z",
      updatedAt: "2025-03-02T12:15:00Z"
    }
  ],
  "2025-03-03": [
    {
      id: "2025-03-03-1",
      name: "昆布おにぎり",
      storeName: "セブンイレブン",
      price: 140,
      imageUrl: "/images/onigiri-sample-6.jpg",
      rating: 3,
      memo: "もう少し昆布の風味が欲しかった。",
      createdAt: "2025-03-03T12:20:00Z",
      updatedAt: "2025-03-03T12:20:00Z"
    }
  ],
  "2025-03-04": [
    {
      id: "2025-03-04-1",
      name: "明太子おにぎり",
      storeName: "ローソン",
      price: 180,
      imageUrl: "/images/onigiri-sample-4.jpg",
      rating: 5,
      memo: "明太子の辛さが絶妙でした。また買いたい。",
      createdAt: "2025-03-04T18:45:00Z",
      updatedAt: "2025-03-04T18:45:00Z"
    }
  ],
  "2025-03-05": [
    {
      id: "2025-03-05-1",
      name: "高菜おにぎり",
      storeName: "ファミリーマート",
      price: 150,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "高菜の味が効いていて美味しかった。",
      createdAt: "2025-03-05T13:30:00Z",
      updatedAt: "2025-03-05T13:30:00Z"
    }
  ],
  "2025-03-06": [
    {
      id: "2025-03-06-1",
      name: "梅おにぎり",
      storeName: "セブンイレブン",
      price: 140,
      imageUrl: "/images/onigiri-sample-6.jpg",
      rating: 3,
      memo: "梅の酸味が強すぎた。",
      createdAt: "2025-03-06T10:20:00Z",
      updatedAt: "2025-03-06T10:20:00Z"
    }
  ],
  "2025-03-07": [
    {
      id: "2025-03-07-1",
      name: "鮭マヨおにぎり",
      storeName: "ローソン",
      price: 170,
      imageUrl: "/images/onigiri-sample-4.jpg",
      rating: 4,
      memo: "鮭の塩加減とマヨネーズの組み合わせが良かった。",
      createdAt: "2025-03-07T12:45:00Z",
      updatedAt: "2025-03-07T12:45:00Z"
    }
  ],
  "2025-03-08": [
    {
      id: "2025-03-08-1",
      name: "たらこおにぎり",
      storeName: "ファミリーマート",
      price: 160,
      imageUrl: "/images/onigiri-sample-2.jpg",
      eatImageUrl: "/images/onigiri-eat-2.jpg",
      rating: 5,
      memo: "たらこの塩加減が絶妙だった。",
      createdAt: "2025-03-08T09:30:00Z",
      updatedAt: "2025-03-08T09:30:00Z"
    }
  ],
  "2025-03-09": [
    {
      id: "2025-03-09-1",
      name: "おかかおにぎり",
      storeName: "セブンイレブン",
      price: 130,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "かつお節の風味が良かった。",
      createdAt: "2025-03-09T11:20:00Z",
      updatedAt: "2025-03-09T11:20:00Z"
    }
  ],
  "2025-03-10": [
    {
      id: "2025-03-10-1",
      name: "いくら醤油おにぎり",
      storeName: "高級おにぎり専門店",
      price: 350,
      imageUrl: "/images/onigiri-sample-4.jpg",
      eatImageUrl: "/images/onigiri-eat-2.jpg",
      rating: 5,
      memo: "高級だけあって最高に美味しかった。",
      createdAt: "2025-03-10T13:15:00Z",
      updatedAt: "2025-03-10T13:15:00Z"
    }
  ],
  "2025-03-11": [
    {
      id: "2025-03-11-1",
      name: "塩むすび",
      storeName: "手作り",
      price: 50,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "シンプルだけど美味しい。",
      createdAt: "2025-03-11T07:30:00Z",
      updatedAt: "2025-03-11T07:30:00Z"
    }
  ],
  "2025-03-12": [
    {
      id: "2025-03-12-1",
      name: "五目おにぎり",
      storeName: "ローソン",
      price: 180,
      imageUrl: "/images/onigiri-sample-2.jpg",
      rating: 4,
      memo: "具材がたっぷりで満足感があった。",
      createdAt: "2025-03-12T12:30:00Z",
      updatedAt: "2025-03-12T12:30:00Z"
    }
  ],
  "2025-03-13": [
    {
      id: "2025-03-13-1",
      name: "昆布おにぎり",
      storeName: "ファミリーマート",
      price: 140,
      imageUrl: "/images/onigiri-sample-6.jpg",
      rating: 3,
      memo: "もう少し昆布の風味が欲しかった。",
      createdAt: "2025-03-13T10:40:00Z",
      updatedAt: "2025-03-13T10:40:00Z"
    }
  ],
  "2025-03-14": [
    {
      id: "2025-03-14-1",
      name: "鮭おにぎり",
      storeName: "セブンイレブン",
      price: 150,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "朝食に食べました。塩加減が絶妙でした。",
      createdAt: "2025-03-14T08:30:00Z",
      updatedAt: "2025-03-14T08:30:00Z"
    }
  ],
  "2025-03-15": [
    {
      id: "2025-03-15-1",
      name: "ツナマヨおにぎり",
      storeName: "ローソン",
      price: 160,
      imageUrl: "/images/onigiri-sample-2.jpg",
      eatImageUrl: "/images/onigiri-eat-2.jpg",
      rating: 5,
      memo: "ツナの量が多くて満足感がありました。",
      createdAt: "2025-03-15T12:15:00Z",
      updatedAt: "2025-03-15T12:15:00Z"
    }
  ],
  "2025-03-16": [
    {
      id: "2025-03-16-1",
      name: "明太子マヨおにぎり",
      storeName: "セブンイレブン",
      price: 180,
      imageUrl: "/images/onigiri-sample-4.jpg",
      rating: 5,
      memo: "明太子とマヨの組み合わせが最高。",
      createdAt: "2025-03-16T14:30:00Z",
      updatedAt: "2025-03-16T14:30:00Z"
    }
  ],
  "2025-03-17": [
    {
      id: "2025-03-17-1",
      name: "高菜おにぎり",
      storeName: "ファミリーマート",
      price: 150,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "高菜の味が効いていて美味しかった。",
      createdAt: "2025-03-17T13:30:00Z",
      updatedAt: "2025-03-17T13:30:00Z"
    }
  ],
  "2025-03-18": [
    {
      id: "2025-03-18-1",
      name: "梅おにぎり",
      storeName: "ローソン",
      price: 140,
      imageUrl: "/images/onigiri-sample-6.jpg",
      rating: 3,
      memo: "梅の酸味が強すぎた。",
      createdAt: "2025-03-18T10:20:00Z",
      updatedAt: "2025-03-18T10:20:00Z"
    }
  ],
  "2025-03-19": [
    {
      id: "2025-03-19-1",
      name: "昆布おにぎり",
      storeName: "セブンイレブン",
      price: 140,
      imageUrl: "/images/onigiri-sample-6.jpg",
      rating: 4,
      memo: "昆布の旨味が効いていた。",
      createdAt: "2025-03-19T11:30:00Z",
      updatedAt: "2025-03-19T11:30:00Z"
    }
  ],
  "2025-03-20": [
    {
      id: "2025-03-20-1",
      name: "鮭おにぎり",
      storeName: "ファミリーマート",
      price: 150,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "朝食に食べました。塩加減が絶妙でした。",
      createdAt: "2025-03-20T08:30:00Z",
      updatedAt: "2025-03-20T08:30:00Z"
    }
  ],
  "2025-03-21": [
    {
      id: "2025-03-21-1",
      name: "ツナマヨおにぎり",
      storeName: "セブンイレブン",
      price: 160,
      imageUrl: "/images/onigiri-sample-2.jpg",
      eatImageUrl: "/images/onigiri-eat-2.jpg",
      rating: 5,
      memo: "ツナの量が多くて満足感がありました。",
      createdAt: "2025-03-21T12:15:00Z",
      updatedAt: "2025-03-21T12:15:00Z"
    }
  ],
  "2025-03-22": [
    {
      id: "2025-03-22-1",
      name: "明太子おにぎり",
      storeName: "ローソン",
      price: 180,
      imageUrl: "/images/onigiri-sample-4.jpg",
      rating: 5,
      memo: "明太子の辛さが絶妙でした。また買いたい。",
      createdAt: "2025-03-22T18:45:00Z",
      updatedAt: "2025-03-22T18:45:00Z"
    }
  ],
  "2025-03-23": [
    {
      id: "2025-03-23-1",
      name: "高菜おにぎり",
      storeName: "ファミリーマート",
      price: 150,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "高菜の味が効いていて美味しかった。",
      createdAt: "2025-03-23T13:30:00Z",
      updatedAt: "2025-03-23T13:30:00Z"
    }
  ],
  "2025-03-24": [
    {
      id: "2025-03-24-1",
      name: "梅おにぎり",
      storeName: "セブンイレブン",
      price: 140,
      imageUrl: "/images/onigiri-sample-6.jpg",
      rating: 3,
      memo: "梅の酸味が強すぎた。",
      createdAt: "2025-03-24T10:20:00Z",
      updatedAt: "2025-03-24T10:20:00Z"
    }
  ],
  "2025-03-25": [
    {
      id: "2025-03-25-1",
      name: "おかかおにぎり",
      storeName: "ローソン",
      price: 130,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "かつお節の風味が良かった。",
      createdAt: "2025-03-25T11:20:00Z",
      updatedAt: "2025-03-25T11:20:00Z"
    }
  ],
  "2025-03-26": [
    {
      id: "2025-03-26-1",
      name: "いくら醤油おにぎり",
      storeName: "高級おにぎり専門店",
      price: 350,
      imageUrl: "/images/onigiri-sample-4.jpg",
      eatImageUrl: "/images/onigiri-eat-2.jpg",
      rating: 5,
      memo: "高級だけあって最高に美味しかった。",
      createdAt: "2025-03-26T13:15:00Z",
      updatedAt: "2025-03-26T13:15:00Z"
    }
  ],
  "2025-03-27": [
    {
      id: "2025-03-27-1",
      name: "塩むすび",
      storeName: "手作り",
      price: 50,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "シンプルだけど美味しい。",
      createdAt: "2025-03-27T07:30:00Z",
      updatedAt: "2025-03-27T07:30:00Z"
    }
  ],
  "2025-03-28": [
    {
      id: "2025-03-28-1",
      name: "五目おにぎり",
      storeName: "ローソン",
      price: 180,
      imageUrl: "/images/onigiri-sample-2.jpg",
      rating: 4,
      memo: "具材がたっぷりで満足感があった。",
      createdAt: "2025-03-28T12:30:00Z",
      updatedAt: "2025-03-28T12:30:00Z"
    }
  ],
  "2025-03-29": [
    {
      id: "2025-03-29-1",
      name: "昆布おにぎり",
      storeName: "ファミリーマート",
      price: 140,
      imageUrl: "/images/onigiri-sample-6.jpg",
      rating: 3,
      memo: "もう少し昆布の風味が欲しかった。",
      createdAt: "2025-03-29T10:40:00Z",
      updatedAt: "2025-03-29T10:40:00Z"
    }
  ],
  "2025-03-30": [
    {
      id: "2025-03-30-1",
      name: "鮭おにぎり",
      storeName: "セブンイレブン",
      price: 150,
      imageUrl: "/images/onigiri-sample-1.jpg",
      rating: 4,
      memo: "朝食に食べました。塩加減が絶妙でした。",
      createdAt: "2025-03-30T08:30:00Z",
      updatedAt: "2025-03-30T08:30:00Z"
    }
  ],
  "2025-03-31": [
    {
      id: "2025-03-31-1",
      name: "ツナマヨおにぎり",
      storeName: "ローソン",
      price: 160,
      imageUrl: "/images/onigiri-sample-2.jpg",
      eatImageUrl: "/images/onigiri-eat-2.jpg",
      rating: 5,
      memo: "ツナの量が多くて満足感がありました。",
      createdAt: "2025-03-31T12:15:00Z",
      updatedAt: "2025-03-31T12:15:00Z"
    }
  ]
};

// 外部から提供されたデータを使用
let currentData = { ...sampleOnigiriData };

// データを更新する関数
export function updateOnigiriData(newData: Record<string, Onigiri[]>) {
  currentData = newData;
}

/**
 * サンプルデータから全てのおにぎりを取得
 */
export function getAllOnigiri(): Onigiri[] {
  return Object.values(currentData).flat();
}

/**
 * 特定の日付のおにぎりを取得
 */
export function getOnigiriByDate(dateString: string): Onigiri[] {
  return currentData[dateString] || [];
}

/**
 * 特定の月のおにぎりを取得
 */
export function getOnigiriByMonth(year: number, month: number): Record<string, Onigiri[]> {
  const result: Record<string, Onigiri[]> = {};
  
  // 月の値は1-12、Date.getMonthは0-11を返すため調整
  const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;
  
  Object.entries(currentData).forEach(([date, onigiriList]) => {
    if (date.startsWith(monthPrefix)) {
      result[date] = onigiriList;
    }
  });
  
  return result;
}

/**
 * 条件に一致するおにぎりを検索
 */
export function searchOnigiri(query: string): Onigiri[] {
  const lowerQuery = query.toLowerCase();
  return getAllOnigiri().filter(
    onigiri => 
      onigiri.name.toLowerCase().includes(lowerQuery) || 
      onigiri.storeName.toLowerCase().includes(lowerQuery) ||
      (onigiri.memo && onigiri.memo.toLowerCase().includes(lowerQuery))
  );
} 