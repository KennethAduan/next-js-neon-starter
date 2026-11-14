"use server"

import { ActionError, authActionClient } from "@/lib/safe.action"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import {
  CreateTodoSchema,
  TodoIdSchema,
  UpdateTodoTitleSchema,
} from "@/features/todos/schema/todo.schema"
import { ROUTES } from "@/constants/app.routes"

const ACTION_NAME = {
  CREATE: "createTodo",
  UPDATE_TITLE: "updateTodoTitle",
  TOGGLE: "toggleTodoCompleted",
  DELETE: "deleteTodo",
} as const

function revalidateTodos() {
  revalidatePath(ROUTES.HOME)
}

export const createTodoAction = authActionClient
  .metadata({ actionName: ACTION_NAME.CREATE })
  .inputSchema(CreateTodoSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx.session?.user.id
    if (!userId) {
      throw new ActionError("Unauthorized")
    }

    const todo = await prisma.todo.create({
      data: {
        title: parsedInput.title,
        createdById: userId,
      },
      select: { id: true },
    })

    revalidateTodos()
    return { success: true as const, id: todo.id }
  })

export const updateTodoTitleAction = authActionClient
  .metadata({ actionName: ACTION_NAME.UPDATE_TITLE })
  .inputSchema(UpdateTodoTitleSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.session?.user.id) {
      throw new ActionError("Unauthorized")
    }

    await prisma.todo.update({
      where: { id: parsedInput.id },
      data: { title: parsedInput.title },
    })

    revalidateTodos()
    return { success: true as const }
  })

export const toggleTodoCompletedAction = authActionClient
  .metadata({ actionName: ACTION_NAME.TOGGLE })
  .inputSchema(TodoIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.session?.user.id) {
      throw new ActionError("Unauthorized")
    }

    const existing = await prisma.todo.findUnique({
      where: { id: parsedInput.id },
      select: { completed: true },
    })
    if (!existing) {
      throw new ActionError("Todo not found")
    }

    await prisma.todo.update({
      where: { id: parsedInput.id },
      data: { completed: !existing.completed },
    })

    revalidateTodos()
    return { success: true as const }
  })

export const deleteTodoAction = authActionClient
  .metadata({ actionName: ACTION_NAME.DELETE })
  .inputSchema(TodoIdSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.session?.user.id) {
      throw new ActionError("Unauthorized")
    }

    await prisma.todo.delete({ where: { id: parsedInput.id } })
    revalidateTodos()
    return { success: true as const }
  })
