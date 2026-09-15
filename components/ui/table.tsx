"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"tr"> & {
  variant?: "default" | "static"
}) {
  return (
    <tr
      data-slot="table-row"
      data-variant={variant}
      className={cn(
        "border-b transition-colors data-[state=selected]:bg-muted",
        variant === "default" &&
          "hover:bg-muted/50 has-aria-expanded:bg-muted/50",
        variant === "static" && "hover:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function TableHead({
  className,
  pinned = false,
  ...props
}: React.ComponentProps<"th"> & {
  pinned?: boolean
}) {
  return (
    <th
      data-slot="table-head"
      data-pinned={pinned || undefined}
      className={cn(
        "h-10 w-(--table-col-width,auto) px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
        pinned
          ? "sticky start-(--table-pin-start) end-(--table-pin-end) z-(--table-pin-z) bg-background opacity-95"
          : "relative",
        className
      )}
      {...props}
    />
  )
}

function TableCell({
  className,
  variant = "default",
  pinned = false,
  ...props
}: React.ComponentProps<"td"> & {
  variant?: "default" | "empty"
  pinned?: boolean
}) {
  return (
    <td
      data-slot="table-cell"
      data-variant={variant}
      data-pinned={pinned || undefined}
      className={cn(
        "w-(--table-col-width,auto) align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        variant === "default" && "p-2",
        variant === "empty" && "min-h-[14rem] px-6 py-10 text-center",
        pinned
          ? "sticky start-(--table-pin-start) end-(--table-pin-end) z-(--table-pin-z) bg-background opacity-95"
          : "relative",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
