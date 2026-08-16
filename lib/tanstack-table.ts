import type {
  ColumnFiltersState,
  ColumnMeta as TanstackColumnMeta,
  ColumnSort,
  ColumnVisibilityState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  TableState as TanstackTableState,
  Updater,
} from "@tanstack/react-table"
import type {
  LegacyColumn,
  LegacyColumnDef,
  LegacyFeatures,
  LegacyReactTable,
  LegacyRow,
  LegacyTableOptions,
} from "@tanstack/react-table/legacy"
import {
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
} from "@tanstack/react-table/legacy"

export type {
  ColumnFiltersState,
  ColumnSort,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  Updater,
}

export type VisibilityState = ColumnVisibilityState
export type TableState = TanstackTableState<LegacyFeatures>
export type TableOptions<TData = unknown> = LegacyTableOptions<TData & RowData>
export type Table<TData = unknown> = LegacyReactTable<TData & RowData>
export type Column<TData = unknown, TValue = unknown> = LegacyColumn<
  TData & RowData,
  TValue
>
export type ColumnDef<TData = unknown, TValue = unknown> = LegacyColumnDef<
  TData & RowData,
  TValue
>
export type Row<TData = unknown> = LegacyRow<TData & RowData>
export type ColumnMeta<TData = unknown, TValue = unknown> = TanstackColumnMeta<
  LegacyFeatures,
  TData & RowData,
  TValue
>

export function useReactTable<TData>(
  options: LegacyTableOptions<TData & RowData>
): LegacyReactTable<TData & RowData> {
  return useLegacyTable(options)
}

export {
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
}
