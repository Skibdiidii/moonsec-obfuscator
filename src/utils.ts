import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let idCounter = 0;
export function generateId(): string {
  idCounter++;
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `${Date.now()}-${idCounter}-${randomPart}`;
}

