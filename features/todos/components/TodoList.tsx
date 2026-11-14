import type { TodoListItem } from "@/features/todos/server/list-todos"
import { TodoRow } from "@/features/todos/components/TodoRow"

type TodoListProps = {
  todos: TodoListItem[]
}

export function TodoList({ todos }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="flex flex-col gap-1 border border-dashed border-border px-4 py-10 text-center">
        <p className="text-sm font-medium text-foreground">Inbox clear</p>
        <p className="text-sm text-muted-foreground">
          Type a task above and press Add.
        </p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-border border-y border-border">
      {todos.map((todo) => (
        <TodoRow
          key={`${todo.id}-${todo.updatedAt.toString()}`}
          todo={todo}
        />
      ))}
    </ul>
  )
}
