# Todos Feature

## Overview

Shared team todo list. Any authenticated user can create, read, update title,
toggle completed, and delete. `createdById` is audit-only — not used for
authorization in the MVP.

## File structure

```
features/todos/
├── actions/todo.action.ts
├── components/
│   ├── CreateTodoForm.tsx
│   ├── TodoList.tsx
│   └── TodoRow.tsx
├── pages/TodosPage.tsx
├── schema/todo.schema.ts
├── server/list-todos.ts
└── todos.docs.md
app/(protected)/page.tsx   # renders TodosPage at ROUTES.HOME
```

## Actions

| Action | Input |
| --- | --- |
| `createTodoAction` | `{ title }` |
| `updateTodoTitleAction` | `{ id, title }` |
| `toggleTodoCompletedAction` | `{ id }` |
| `deleteTodoAction` | `{ id }` |

All use `authActionClient`. Session required. No per-row ownership checks.

## Out of scope

Private todos, assignees, due dates, attachments/R2, server-paginated table API.
