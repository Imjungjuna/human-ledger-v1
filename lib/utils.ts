import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { CSSProperties } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const FONT = "var(--font-geulseedang-goyo)";
export const CREEPY_STYLE: CSSProperties = { fontFamily: FONT };

export function generateCardTransform(): string {
  const rotate = Math.random() * 2 - 1;
  const x = Math.random() * 10 - 5;
  const y = Math.random() * 10 - 5;
  return `rotate(${rotate}deg) translate(${x}px, ${y}px)`;
}
