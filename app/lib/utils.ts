import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSSクラス名のマージユーティリティ
 * clsxとtailwind-mergeを組み合わせて、競合するTailwindクラスを適切にマージします
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 