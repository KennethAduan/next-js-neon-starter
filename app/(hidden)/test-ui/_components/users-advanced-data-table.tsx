"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryState } from "nuqs"
import * as React from "react"
import { sileo } from "sileo"

import { DataTable } from "@/components/data-table/data-table"
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar"
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { DataTableSortList } from "@/components/data-table/data-table-sort-list"
import { useDataTable } from "@/hooks/use-data-table"
import { getFiltersStateParser } from "@/lib/parsers"
import type { User } from "../_mock/users"
import { getUsers, type GetUsersParams } from "../_actions/get-users"
import { userColumns } from "./users-columns"

const DEFAULT_PAGE_SIZE = 10

export function UsersAdvancedDataTable() {
  const [page] = useQueryState("page", parseAsInteger.withDefault(1))
  const [perPage] = useQueryState(
    "perPage",
    parseAsInteger.withDefault(DEFAULT_PAGE_SIZE)
  )
  const [sort] = useQueryState("sort", parseAsString)
  const [filters] = useQueryState(
    "filters",
    getFiltersStateParser<User>().withDefault([])
  )
  const [joinOperator] = useQueryState(
    "joinOperator",
    parseAsStringEnum(["and", "or"]).withDefault("and")
  )

  const params: GetUsersParams = {
    page,
    perPage,
    sort,
    name: null,
    email: null,
    status: null,
    role: null,
    age: null,
    createdAt: null,
    filters,
    joinOperator,
  }

  const query = useQuery({
    queryKey: ["test-ui-users-advanced", params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  })
  const { data, isLoading } = query

  const previousFiltersKey = React.useRef<string | null>(null)
  const didApplyFilter = React.useRef(false)

  React.useEffect(() => {
    const key = JSON.stringify(filters)
    if (previousFiltersKey.current !== null && key !== previousFiltersKey.current) {
      didApplyFilter.current = filters.length > 0
    }
    previousFiltersKey.current = key
  }, [filters])

  const isFirstResult = React.useRef(true)
  React.useEffect(() => {
    if (!data) return
    if (isFirstResult.current) {
      isFirstResult.current = false
      return
    }
    if (didApplyFilter.current) {
      didApplyFilter.current = false
      sileo.info({
        title: `${data.data.length} result${data.data.length === 1 ? "" : "s"} found`,
      })
    }
  }, [data])

  const { table } = useDataTable({
    data: data?.data ?? [],
    columns: userColumns,
    pageCount: data?.pageCount ?? 1,
    enableAdvancedFilter: true,
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
      <DataTableAdvancedToolbar table={table}>
        <DataTableSortList table={table} />
        <DataTableFilterList table={table} />
      </DataTableAdvancedToolbar>
    </DataTable>
  )
}
