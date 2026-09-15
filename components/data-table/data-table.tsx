import { flexRender } from "@tanstack/react-table";
import type { Table as TanstackTable } from "@/lib/tanstack-table";
import type * as React from "react";

import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCommonPinningProps } from "@/lib/data-table";
import { cn } from "@/lib/utils";

interface DataTableProps<TData> extends React.ComponentProps<"div"> {
  table: TanstackTable<TData>;
  actionBar?: React.ReactNode;
  /** Wraps the bordered table region (e.g. page-specific surface styling). */
  frameClassName?: string;
  /**
   * Extra classes on the overflow frame (same wrapper as `frameClassName`).
   * Prefer `frameClassName`; kept for callers that previously targeted `<table>`.
   */
  tableClassName?: string;
  /** Applied to the pagination row wrapper below the table. */
  paginationClassName?: string;
  /** Replaces the default “No results.” empty row. */
  emptyState?: React.ReactNode;
}

// fallow-ignore-next-line complexity
export function DataTable<TData>({
  table,
  actionBar,
  children,
  className,
  frameClassName,
  tableClassName,
  paginationClassName,
  emptyState,
  ...props
}: DataTableProps<TData>) {
  return (
    <div
      className={cn("flex w-full flex-col gap-2.5 overflow-auto", className)}
      {...props}
    >
      {children}
      <div
        className={cn(
          "overflow-hidden rounded-md border",
          frameClassName,
          tableClassName,
        )}
      >
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { style, pinned } = getCommonPinningProps({
                    column: header.column,
                  });
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      pinned={pinned}
                      style={
                        {
                          "--table-col-width": style["--table-col-width"],
                          "--table-pin-start": style["--table-pin-start"],
                          "--table-pin-end": style["--table-pin-end"],
                          "--table-pin-z": style["--table-pin-z"],
                        } as React.CSSProperties
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    const { style, pinned } = getCommonPinningProps({
                      column: cell.column,
                    });
                    return (
                      <TableCell
                        key={cell.id}
                        pinned={pinned}
                        style={
                          {
                            "--table-col-width": style["--table-col-width"],
                            "--table-pin-start": style["--table-pin-start"],
                            "--table-pin-end": style["--table-pin-end"],
                            "--table-pin-z": style["--table-pin-z"],
                          } as React.CSSProperties
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  variant={emptyState ? "empty" : "default"}
                  className={emptyState ? "align-middle" : "h-24 text-center"}
                >
                  {emptyState ?? "No results."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className={cn("flex flex-col gap-2.5", paginationClassName)}>
        <DataTablePagination table={table} />
        {actionBar &&
          table.getFilteredSelectedRowModel().rows.length > 0 &&
          actionBar}
      </div>
    </div>
  );
}
