# TanStack Table v8 to v9 Migration Instructions

## Objective

Migrate existing TanStack Table implementations from **TanStack Table v8** to **TanStack Table v9** while preserving existing table behavior, UI, filtering, sorting, pagination, row selection, and other features.

The migration should prioritize compatibility first, then optimize the implementation using the new v9 feature system.

---

# Phase 1: Upgrade the Package

Update TanStack Table to the latest v9 release.

Using Bun:

```bash
bun add @tanstack/react-table@latest
```

Or npm:

```bash
npm install @tanstack/react-table@latest
```

After upgrading, expect TypeScript errors in existing table components. Resolve them using the steps below rather than suppressing them.

---

# Phase 2: Replace `useReactTable` with `useTable`

Search the project for:

```tsx
useReactTable
```

Replace:

```tsx
import {
  useReactTable,
} from "@tanstack/react-table"
```

with:

```tsx
import {
  useTable,
} from "@tanstack/react-table"
```

Then change:

```tsx
const table = useReactTable({
  // options
})
```

to:

```tsx
const table = useTable({
  // options
})
```

Do this for every TanStack Table implementation.

---

# Phase 3: Start With `stockFeatures`

For the initial migration, do not immediately convert every table into individually registered v9 features.

Use:

```tsx
import {
  stockFeatures,
  useTable,
} from "@tanstack/react-table"
```

Then add:

```tsx
const table = useTable({
  features: stockFeatures,
  data,
  columns,
})
```

`stockFeatures` enables the standard TanStack Table features and provides behavior closest to TanStack Table v8.

Use this during the first migration pass to minimize breaking changes.

Example:

### Before

```tsx
const table = useReactTable({
  data,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})
```

### Initial v9 Migration

```tsx
const table = useTable({
  features: stockFeatures,
  data,
  columns,
})
```

Do not optimize features yet.

First make sure the table works correctly.

---

# Phase 4: Remove `getCoreRowModel`

Search for:

```tsx
getCoreRowModel
```

Remove the import:

```tsx
import {
  getCoreRowModel,
} from "@tanstack/react-table"
```

Then remove:

```tsx
getCoreRowModel: getCoreRowModel(),
```

from the table configuration.

TanStack Table v9 includes the core row model automatically.

---

# Phase 5: Migrate Row Models

TanStack Table v9 changes row-model factories.

Use the following replacements.

| TanStack Table v8          | TanStack Table v9             |
| -------------------------- | ----------------------------- |
| `getCoreRowModel()`        | Remove it                     |
| `getFilteredRowModel()`    | `createFilteredRowModel()`    |
| `getSortedRowModel()`      | `createSortedRowModel()`      |
| `getPaginationRowModel()`  | `createPaginatedRowModel()`   |
| `getExpandedRowModel()`    | `createExpandedRowModel()`    |
| `getGroupedRowModel()`     | `createGroupedRowModel()`     |
| `getFacetedRowModel()`     | `createFacetedRowModel()`     |
| `getFacetedMinMaxValues()` | `createFacetedMinMaxValues()` |
| `getFacetedUniqueValues()` | `createFacetedUniqueValues()` |

However, these functions should no longer be passed directly to `useTable()`.

They belong inside `tableFeatures()`.

Example:

```tsx
const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,

  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})
```

Then:

```tsx
const table = useTable({
  features,
  data,
  columns,
})
```

---

# Phase 6: Identify Which Features Each Table Actually Uses

After the table works using `stockFeatures`, determine which features are actually needed.

Available common features include:

```tsx
columnFacetingFeature
columnFilteringFeature
columnGroupingFeature
columnOrderingFeature
columnPinningFeature
columnResizingFeature
columnSizingFeature
columnVisibilityFeature

globalFilteringFeature

rowAggregationFeature
rowExpandingFeature
rowPaginationFeature
rowPinningFeature
rowSelectionFeature
rowSortingFeature
```

For example, if a table supports:

* sorting
* filtering
* pagination
* column visibility
* row selection

the feature configuration may look like:

```tsx
import {
  tableFeatures,
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  createFilteredRowModel,
  createPaginatedRowModel,
} from "@tanstack/react-table"
```

Then:

```tsx
const features = tableFeatures({
  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,
  columnFilteringFeature,
  columnVisibilityFeature,

  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})
```

Then:

```tsx
const table = useTable({
  features,
  data,
  columns,
})
```

---

# Phase 7: Keep Existing Controlled State Initially

Existing React state does not need to be completely rewritten.

For example, this pattern can remain:

```tsx
const [sorting, setSorting] = useState<SortingState>([])

const [columnFilters, setColumnFilters] =
  useState<ColumnFiltersState>([])

const [columnVisibility, setColumnVisibility] =
  useState<VisibilityState>({})

const [rowSelection, setRowSelection] = useState({})
```

Then:

```tsx
const table = useTable({
  features,
  data,
  columns,

  state: {
    sorting,
    columnFilters,
    columnVisibility,
    rowSelection,
  },

  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  onColumnVisibilityChange: setColumnVisibility,
  onRowSelectionChange: setRowSelection,
})
```

Do not migrate immediately to TanStack Store, atoms, or `table.Subscribe` unless there is an actual performance reason.

---

# Phase 8: Replace `table.getState()`

Search the project for:

```tsx
table.getState()
```

Replace it with:

```tsx
table.state
```

Example:

### Before

```tsx
table.getState().pagination.pageIndex
```

### After

```tsx
table.state.pagination.pageIndex
```

Before:

```tsx
const {
  sorting,
  pagination,
} = table.getState()
```

After:

```tsx
const {
  sorting,
  pagination,
} = table.state
```

Use `table.state` as the default state-reading API.

---

# Phase 9: Audit Destructured Instance Methods

This is an important breaking change.

Search for code that destructures methods from:

* rows
* cells
* columns
* headers
* related table objects

For example, this should no longer be used:

```tsx
const { getValue } = row

const name = getValue("name")
```

Replace it with:

```tsx
const name = row.getValue("name")
```

Likewise, avoid:

```tsx
const { getContext } = cell
```

Use:

```tsx
cell.getContext()
```

Avoid:

```tsx
const { getCanSort } = column
```

Use:

```tsx
column.getCanSort()
```

Avoid:

```tsx
const { getContext } = header
```

Use:

```tsx
header.getContext()
```

### Rule

Always call instance methods directly from their owning object.

Preferred:

```tsx
row.getValue()
cell.getContext()
column.getCanSort()
header.getContext()
```

Do not detach the methods from their instances.

---

# Phase 10: Update Sorting API Names

Search for:

```tsx
sortingFn
```

Replace it with:

```tsx
sortFn
```

Example:

### Before

```tsx
{
  accessorKey: "name",
  sortingFn: "alphanumeric",
}
```

### After

```tsx
{
  accessorKey: "name",
  sortFn: "alphanumeric",
}
```

Also check for other sorting API names.

For example:

```tsx
getSortingFn()
```

becomes:

```tsx
getSortFn()
```

And the type:

```tsx
SortingFn
```

becomes:

```tsx
SortFn
```

---

# Phase 11: Update Column Pinning

If the application uses column pinning, replace directional terminology.

### Before

```tsx
column.pin("left")
column.pin("right")
```

### After

```tsx
column.pin("start")
column.pin("end")
```

Also replace:

```tsx
columnPinning.left
```

with:

```tsx
columnPinning.start
```

Replace:

```tsx
columnPinning.right
```

with:

```tsx
columnPinning.end
```

And update APIs such as:

```tsx
row.getLeftVisibleCells()
```

to the equivalent `start` API.

---

# Phase 12: Remove `onStateChange`

Search for:

```tsx
onStateChange
```

The top-level `onStateChange` table option has been removed.

Feature-specific handlers can still be used.

For example:

```tsx
onSortingChange
onPaginationChange
onColumnFiltersChange
onColumnVisibilityChange
onRowSelectionChange
```

If the application needs to observe every table state change, use:

```tsx
table.store.subscribe((state) => {
  console.log(state)
})
```

Do not recreate a global `onStateChange` abstraction unless there is a real requirement for it.

---

# Phase 13: Keep Existing Table Markup

Do not unnecessarily rewrite the table UI.

Existing Shadcn/TanStack markup should generally remain similar.

For example:

```tsx
<Table>
  <TableHeader>
    {table.getHeaderGroups().map((headerGroup) => (
      <TableRow key={headerGroup.id}>
        {headerGroup.headers.map((header) => (
          <TableHead key={header.id}>
            {header.isPlaceholder
              ? null
              : flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
          </TableHead>
        ))}
      </TableRow>
    ))}
  </TableHeader>

  <TableBody>
    {table.getRowModel().rows.map((row) => (
      <TableRow key={row.id}>
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(
              cell.column.columnDef.cell,
              cell.getContext(),
            )}
          </TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

Do not rewrite markup simply because the table was upgraded to v9.

---

# Phase 14: Optimize `stockFeatures`

Once every feature works correctly, replace:

```tsx
features: stockFeatures
```

with a custom `tableFeatures()` definition.

Example:

```tsx
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,

  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,

  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})
```

This allows unused TanStack Table features to be removed from the production bundle.

---

# Phase 15: Avoid Importing Entire Function Registries

Avoid:

```tsx
import {
  filterFns,
  sortFns,
} from "@tanstack/react-table"
```

unless the table genuinely needs many built-in functions.

Prefer importing the individual functions being used.

For example:

```tsx
import {
  filterFn_includesString,
  sortFn_alphanumeric,
  sortFn_text,
} from "@tanstack/react-table"
```

Then:

```tsx
const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,

  filterFns: {
    includesString: filterFn_includesString,
  },

  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
  },
})
```

This improves tree-shaking.

---

# Phase 16: Do Not Introduce Store Optimization Prematurely

TanStack Table v9 supports:

```tsx
table.state
table.store
table.atoms
table.Subscribe
```

For most application tables, continue using:

```tsx
table.state
```

and existing React controlled state.

Only use `table.atoms` or `table.Subscribe` when table performance has actually become a problem.

Example of a future optimization:

```tsx
<table.Subscribe
  selector={(state) => ({
    pagination: state.pagination,
  })}
>
  {({ pagination }) => (
    <Pagination
      pageIndex={pagination.pageIndex}
    />
  )}
</table.Subscribe>
```

This should be treated as an optimization step rather than a migration requirement.

---

# Recommended Migration Order

Follow this exact order for each existing table.

## Step 1

Upgrade:

```bash
bun add @tanstack/react-table@latest
```

## Step 2

Replace:

```tsx
useReactTable
```

with:

```tsx
useTable
```

## Step 3

Temporarily use:

```tsx
features: stockFeatures
```

## Step 4

Remove:

```tsx
getCoreRowModel()
```

## Step 5

Resolve TypeScript and API errors.

## Step 6

Replace:

```tsx
table.getState()
```

with:

```tsx
table.state
```

## Step 7

Fix destructured instance methods.

## Step 8

Replace renamed APIs such as:

```text
sortingFn → sortFn
left/right → start/end
```

## Step 9

Test the existing table behavior.

Verify:

* rendering
* sorting
* filtering
* global search
* pagination
* page size
* column visibility
* row selection
* column sorting
* custom cell rendering
* action menus
* server-side pagination if applicable
* server-side filtering if applicable
* server-side sorting if applicable

## Step 10

Replace:

```tsx
stockFeatures
```

with:

```tsx
tableFeatures(...)
```

containing only the features used by that table.

## Step 11

Move required row models into `tableFeatures()`.

## Step 12

Remove unused imports and deprecated APIs.

## Step 13

Run:

```bash
bun run lint
bun run typecheck
bun run build
```

All three should pass before the migration is considered complete.

---

# Example Complete Migration

## Before: TanStack Table v8

```tsx
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  // ...
}
```

---

# Initial v9 Migration

Use this first:

```tsx
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  stockFeatures,
  useTable,
} from "@tanstack/react-table"

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useTable({
    features: stockFeatures,

    data,
    columns,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  })

  // ...
}
```

Verify that the existing table works before proceeding.

---

# Optimized v9 Version

After the migration is stable:

```tsx
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  flexRender,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table"
```

Create the features outside the component when possible:

```tsx
const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,

  rowSortingFeature,
  rowPaginationFeature,
  rowSelectionFeature,

  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
})
```

Then:

```tsx
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] =
    useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})

  const table = useTable({
    features,

    data,
    columns,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
  })

  // ...
}
```

---

# Migration Rules for This Codebase

When migrating existing TanStack tables, follow these rules:

1. Preserve the existing UI and functionality.
2. Do not redesign table components during the migration.
3. Do not introduce new table features unless required.
4. Do not migrate existing React state to TanStack Store unless necessary.
5. Use `stockFeatures` as the first migration step.
6. Replace `stockFeatures` with explicit `tableFeatures()` after the table is stable.
7. Register only the features actually used by the table.
8. Remove `getCoreRowModel()`.
9. Register row models inside `tableFeatures()`.
10. Call row, cell, column, and header methods directly on their owning object.
11. Replace `table.getState()` with `table.state`.
12. Replace deprecated or renamed APIs.
13. Preserve TypeScript type safety. Do not use `any` to bypass migration errors.
14. Ensure linting, type checking, and builds pass.
15. Test every existing table feature before considering the migration complete.

---

# Search Checklist

Search the entire codebase for the following:

```text
useReactTable
getCoreRowModel
getFilteredRowModel
getSortedRowModel
getPaginationRowModel
getExpandedRowModel
getGroupedRowModel
getFacetedRowModel
getFacetedMinMaxValues
getFacetedUniqueValues
table.getState()
onStateChange
sortingFn
getSortingFn
SortingFn
.pin("left")
.pin("right")
columnPinning.left
columnPinning.right
getLeftVisibleCells
getRightVisibleCells
```

Also manually inspect any code that destructures methods from:

```text
row
cell
column
header
```

Examples to fix:

```tsx
const { getValue } = row
const { getContext } = cell
const { getCanSort } = column
const { getContext } = header
```

---

# Definition of Done

The TanStack Table migration is complete only when:

* [ ] `@tanstack/react-table` is running v9.
* [ ] No application tables use `useReactTable`.
* [ ] No application tables use `getCoreRowModel`.
* [ ] Required v9 features are explicitly registered.
* [ ] Required row models use the v9 factories.
* [ ] Existing sorting works.
* [ ] Existing filtering works.
* [ ] Existing pagination works.
* [ ] Existing row selection works.
* [ ] Existing column visibility works.
* [ ] Existing custom columns and cells work.
* [ ] Existing action menus work.
* [ ] Server-side table operations still work where applicable.
* [ ] No instance methods are incorrectly destructured.
* [ ] No deprecated APIs remain.
* [ ] TypeScript passes without migration-related errors.
* [ ] Lint passes.
* [ ] Production build passes.
* [ ] Existing table UI has not changed unexpectedly.

Do not perform unrelated refactors as part of the TanStack Table migration.
