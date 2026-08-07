"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { IconDotsVertical } from "@tabler/icons-react"

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
  type User,
} from "../_mock/users"

const statusVariantMap: Record<
  User["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  pending: "outline",
  inactive: "secondary",
}

export const userColumns: ColumnDef<User>[] = [
  {
    id: "name",
    accessorKey: "name",
    enableColumnFilter: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Name" />
    ),
    meta: {
      label: "Name",
      placeholder: "Search name…",
      variant: "text",
    },
  },
  {
    id: "email",
    accessorKey: "email",
    enableColumnFilter: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Email" />
    ),
    meta: {
      label: "Email",
      placeholder: "Search email…",
      variant: "text",
    },
  },
  {
    id: "status",
    accessorKey: "status",
    enableColumnFilter: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue<User["status"]>("status")
      return (
        <Badge variant={statusVariantMap[status]} className="capitalize">
          {status}
        </Badge>
      )
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: USER_STATUS_OPTIONS,
    },
  },
  {
    id: "role",
    accessorKey: "role",
    enableColumnFilter: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Role" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground capitalize">
        {row.getValue<string>("role")}
      </span>
    ),
    meta: {
      label: "Role",
      variant: "select",
      options: USER_ROLE_OPTIONS,
    },
  },
  {
    id: "age",
    accessorKey: "age",
    enableColumnFilter: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Age" />
    ),
    meta: {
      label: "Age",
      variant: "range",
      range: [18, 65],
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    enableColumnFilter: true,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} label="Created At" />
    ),
    cell: ({ row }) =>
      new Date(row.getValue<string>("createdAt")).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    meta: {
      label: "Created At",
      variant: "date",
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={() => (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              aria-label="Row actions"
            >
              <IconDotsVertical className="size-4" />
            </Button>
          )}
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem>View</DropdownMenuItem>
          <DropdownMenuItem>Edit</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
