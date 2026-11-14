import { listTodos } from "@/features/todos/server/list-todos"
import { CreateTodoForm } from "@/features/todos/components/CreateTodoForm"
import { TodoList } from "@/features/todos/components/TodoList"

export async function TodosPage() {
  const todos = await listTodos()
  const openCount = todos.filter((todo) => !todo.completed).length

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8">
      <header className="flex items-start justify-between gap-4 border-b border-border pb-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Todos
          </h1>
          <p className="text-sm text-muted-foreground">
            Shared team list. Anyone signed in can edit.
          </p>
        </div>
        <p
          className="shrink-0 text-right font-mono tabular-nums"
          aria-label={`${openCount} open of ${todos.length} total`}
        >
          <span className="block text-3xl font-semibold leading-none text-brand">
            {openCount}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            open · {todos.length} total
          </span>
        </p>
      </header>

      <CreateTodoForm />
      <TodoList todos={todos} />
    </div>
  )
}
