"use client"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"
import { sileo } from "sileo"
import { IconTrash } from "@tabler/icons-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { onActionError } from "@/lib/action-utils"
import type { TodoListItem } from "@/features/todos/server/list-todos"
import {
  deleteTodoAction,
  toggleTodoCompletedAction,
  updateTodoTitleAction,
} from "@/features/todos/actions/todo.action"

type TodoRowProps = {
  todo: TodoListItem
}

export function TodoRow({ todo }: TodoRowProps) {
  const [title, setTitle] = useState(todo.title)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const { executeAsync: toggleAsync, isExecuting: isToggling } = useAction(
    toggleTodoCompletedAction,
    { onError: onActionError }
  )

  const { executeAsync: updateAsync, isExecuting: isUpdating } = useAction(
    updateTodoTitleAction,
    {
      onError: onActionError,
    }
  )

  const { executeAsync: deleteAsync, isExecuting: isDeleting } = useAction(
    deleteTodoAction,
    {
      onSuccess: ({ data }) => {
        if (data?.success) {
          sileo.success({ title: "Todo deleted" })
          setConfirmOpen(false)
        }
      },
      onError: onActionError,
    }
  )

  const busy = isToggling || isUpdating || isDeleting

  async function saveTitle() {
    const next = title.trim()
    if (!next || next === todo.title) {
      setTitle(todo.title)
      return
    }
    await updateAsync({ id: todo.id, title: next })
  }

  return (
    <li
      className={cn(
        "group flex items-center gap-3 py-3",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
      )}
    >
      <Checkbox
        aria-label={todo.completed ? "Mark incomplete" : "Mark complete"}
        checked={todo.completed}
        disabled={busy}
        variant="brand"
        className="mt-1"
        onCheckedChange={() => {
          void toggleAsync({ id: todo.id })
        }}
      />

      <div className="min-w-0 flex-1">
        <Input
          aria-label="Todo title"
          variant="plain"
          completed={todo.completed}
          value={title}
          disabled={busy}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => {
            void saveTitle()
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur()
            }
            if (event.key === "Escape") {
              setTitle(todo.title)
              event.currentTarget.blur()
            }
          }}
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Delete todo"
        disabled={busy}
        onClick={() => setConfirmOpen(true)}
      >
        <IconTrash />
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete todo?</DialogTitle>
            <DialogDescription>
              This removes “{todo.title}” for everyone on the team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              isLoading={isDeleting}
              onClick={() => {
                void deleteAsync({ id: todo.id })
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </li>
  )
}
