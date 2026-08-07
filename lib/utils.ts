import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isEmptyString = (value: string | null | undefined) => {
  return value === "" || value === null || value === undefined
}

export const isNull = (value: unknown): boolean => {
  return value === null || value === undefined
}

export const isNotNull = (value: unknown): boolean => {
  return value !== null && value !== undefined
}
