"use server"

import type { ExtendedColumnFilter, JoinOperator } from "@/types/data-table"
import { MOCK_USERS, type User } from "../_mock/users"

export type GetUsersParams = {
  page: number
  perPage: number
  sort: string | null
  name: string | null
  email: string | null
  status: string | null
  role: string | null
  age: string | null
  createdAt: string | null
  filters?: Array<ExtendedColumnFilter<User>>
  joinOperator?: JoinOperator
}

export type GetUsersResult = {
  data: User[]
  pageCount: number
}

function parseNumericBound(value: string | undefined): number | null {
  if (!value) return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}

function parseTimestamp(value: string | undefined): number | null {
  if (!value) return null
  const ts = new Date(value).getTime()
  return Number.isNaN(ts) ? null : ts
}

function isAboveMin(value: number, min: number | null): boolean {
  return min === null || value >= min
}

function isBelowMax(value: number, max: number | null): boolean {
  return max === null || value <= max
}

function isWithinBounds(
  value: number,
  min: number | null,
  max: number | null
): boolean {
  return isAboveMin(value, min) && isBelowMax(value, max)
}

function parseCommaSeparated(param: string | null): string[] {
  if (!param) return []
  return param.split(",").filter(Boolean)
}

function matchesTextFilter(value: string, query: string | null): boolean {
  if (!query) return true
  return value.toLowerCase().includes(query.toLowerCase())
}

function matchesMultiSelectFilter(value: string, param: string | null): boolean {
  const selected = parseCommaSeparated(param)
  if (selected.length === 0) return true
  return selected.includes(value)
}

function matchesAgeRange(age: number, param: string | null): boolean {
  if (!param) return true
  const [minStr, maxStr] = param.split(",")
  return isWithinBounds(
    age,
    parseNumericBound(minStr),
    parseNumericBound(maxStr)
  )
}

function matchesCreatedAtRange(createdAt: string, param: string | null): boolean {
  if (!param) return true
  const dates = parseCommaSeparated(param)
  const userTs = new Date(createdAt).getTime()
  return isWithinBounds(userTs, parseTimestamp(dates[0]), parseTimestamp(dates[1]))
}

function userMatchesFilters(
  user: User,
  params: GetUsersParams,
  checks: Array<(user: User, params: GetUsersParams) => boolean>
): boolean {
  return checks.every((check) => check(user, params))
}

function filterUsers(users: User[], params: GetUsersParams): User[] {
  const checks: Array<(user: User, params: GetUsersParams) => boolean> = [
    (user, params) => matchesTextFilter(user.name, params.name),
    (user, params) => matchesTextFilter(user.email, params.email),
    (user, params) => matchesMultiSelectFilter(user.status, params.status),
    (user, params) => matchesMultiSelectFilter(user.role, params.role),
    (user, params) => matchesAgeRange(user.age, params.age),
    (user, params) => matchesCreatedAtRange(user.createdAt, params.createdAt),
  ]
  return users.filter((user) => userMatchesFilters(user, params, checks))
}

function toComparable(value: unknown): string {
  return String(value ?? "")
}

function matchesEquality(
  actual: string,
  expected: string,
  operator: ExtendedColumnFilter<User>["operator"]
): boolean {
  const isEqual = actual.toLowerCase() === expected.toLowerCase()
  return operator === "!=" ? !isEqual : isEqual
}

function matchesMembership(
  actual: string,
  expected: string | string[],
  operator: ExtendedColumnFilter<User>["operator"]
): boolean {
  const selected = Array.isArray(expected) ? expected : [expected]
  const included = selected.includes(actual)
  return operator === "not-in" ? !included : included
}

function matchesNumberComparison(
  actual: number,
  expected: number,
  operator: ExtendedColumnFilter<User>["operator"]
): boolean {
  switch (operator) {
    case "==":
      return actual === expected
    case "!=":
      return actual !== expected
    case "<":
      return actual < expected
    case "<=":
      return actual <= expected
    case ">":
      return actual > expected
    case ">=":
      return actual >= expected
    default:
      return true
  }
}

function firstValue(value: string | string[]): string {
  return Array.isArray(value) ? (value[0] ?? "") : value
}

function matchesAdvancedFilter(
  user: User,
  filter: ExtendedColumnFilter<User>
): boolean {
  const actual = user[filter.id]

  switch (filter.variant) {
    case "multiSelect":
      return matchesMembership(toComparable(actual), filter.value, filter.operator)
    case "number":
    case "range":
      return matchesNumberComparison(
        Number(actual),
        Number(firstValue(filter.value)),
        filter.operator
      )
    case "date":
    case "dateRange":
      return matchesNumberComparison(
        new Date(toComparable(actual)).getTime(),
        Number(firstValue(filter.value)),
        filter.operator
      )
    default:
      return matchesEquality(
        toComparable(actual),
        firstValue(filter.value),
        filter.operator
      )
  }
}

function applyAdvancedFilters(
  users: User[],
  filters: Array<ExtendedColumnFilter<User>>,
  joinOperator: JoinOperator
): User[] {
  if (filters.length === 0) return users

  return users.filter((user) => {
    const results = filters.map((filter) => matchesAdvancedFilter(user, filter))
    return joinOperator === "or"
      ? results.some(Boolean)
      : results.every(Boolean)
  })
}

function parseSortDirection(value: string): "asc" | "desc" | null {
  if (value === "asc" || value === "desc") return value
  return null
}

function parseSortToken(
  token: string
): { id: keyof User; dir: "asc" | "desc" } | null {
  const [field, dirValue] = token.split(".")
  const dir = parseSortDirection(dirValue ?? "")
  if (!field || !dir) return null
  return { id: field as keyof User, dir }
}

function parseSort(
  sort: string | null
): { id: keyof User; dir: "asc" | "desc" } | null {
  if (!sort) return null
  return parseSortToken(sort.split(",")[0] ?? "")
}

function compareUserValues(
  aVal: User[keyof User],
  bVal: User[keyof User],
  dir: "asc" | "desc"
): number {
  if (aVal === bVal) return 0
  const cmp = aVal < bVal ? -1 : 1
  return dir === "desc" ? -cmp : cmp
}

function sortUsers(users: User[], sort: string | null): User[] {
  const parsed = parseSort(sort)
  if (!parsed) return users
  const { id, dir } = parsed
  return users.toSorted((a, b) => compareUserValues(a[id], b[id], dir))
}

export async function getUsers(params: GetUsersParams): Promise<GetUsersResult> {
  // Public demo data, deliberately not auth-gated: this page teaches the
  // React Query pattern, not authorization. See /test-ui/auth for that.

  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 400))

  const filtered = applyAdvancedFilters(
    filterUsers(MOCK_USERS, params),
    params.filters ?? [],
    params.joinOperator ?? "and"
  )
  const sorted = sortUsers(filtered, params.sort)
  const pageCount = Math.max(1, Math.ceil(filtered.length / params.perPage))
  const data = sorted.slice((params.page - 1) * params.perPage, params.page * params.perPage)

  return { data, pageCount }
}
