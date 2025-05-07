import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: string | number): string {
  if (num === 'N/A' || num === undefined) return 'N/A';
  
  // Convert string to number if needed
  const value = typeof num === 'string' ? parseInt(num, 10) : num;
  
  // Check if valid number
  if (isNaN(value)) return 'N/A';
  
  // Format with commas
  return value.toLocaleString();
}
