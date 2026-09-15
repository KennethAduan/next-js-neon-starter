export { cn } from "cn";

export const isEmptyString = (value: string | null | undefined) => {
  return value === "" || value === null || value === undefined
}

export const isNull = (value: unknown): boolean => {
  return value === null || value === undefined
}

export const isNotNull = (value: unknown): boolean => {
  return value !== null && value !== undefined
}
