import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * クラス名を結合するユーティリティ関数
 * clsxとtailwind-mergeを組み合わせてTailwindのクラス名の競合を解決します
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
} 