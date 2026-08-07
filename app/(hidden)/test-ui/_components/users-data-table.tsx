"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
} from "nuqs"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { useDataTable } from "@/hooks/use-data-table"
import { getUsers, type GetUsersParams } from "../_actions/get-users"
import { userColumns } from "./users-columns"

const DEFAULT_PAGE_SIZE = 10
const SEPARATOR = ","

function buildGetUsersParams(
  page: number,
  perPage: number,
  sort: string | null,
  filters: {
    name: string | null
    email: string | null
    status: string[] | null
    role: string[] | null
    age: string | null
    createdAt: string[] | null
  }
): GetUsersParams {
  return {
    page,
    perPage,
    sort,
    name: filters.name,
    email: filters.email,
    status: filters.status?.join(SEPARATOR) ?? null,
    role: filters.role?.join(SEPARATOR) ?? null,
    age: filters.age,
    createdAt: filters.createdAt?.join(SEPARATOR) ?? null,
  }
}

function useUsersTableQuery() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1))
  const [perPage] = useQueryState("perPage", parseAsInteger.withDefault(DEFAULT_PAGE_SIZE))
  const [sort] = useQueryState("sort", parseAsString)
  const [filters] = useQueryStates({
    name: parseAsString,
    email: parseAsString,
    status: parseAsArrayOf(parseAsString, SEPARATOR),
    role: parseAsArrayOf(parseAsString, SEPARATOR),
    age: parseAsString,
    createdAt: parseAsArrayOf(parseAsString, SEPARATOR),
  })

  const params = buildGetUsersParams(page, perPage, sort, filters)

  const query = useQuery({
    queryKey: ["test-ui-users", params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  })

  return { query, page, perPage }
}

// fallow-ignore-next-line complexity
export function UsersDataTable() {
  const { query } = useUsersTableQuery()
  const { data, isLoading } = query

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: userColumns,
    pageCount: data?.pageCount ?? 1,
  })

  if (isLoading) {
    return (
      <DataTableSkeleton
        columnCount={userColumns.length}
        filterCount={5}
        rowCount={DEFAULT_PAGE_SIZE}
      />
    )
  }

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  )
}
