import { prisma } from "@/lib/prisma"

export async function listTodos() {
  return prisma.todo.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      completed: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
    },
  })
}

export type TodoListItem = Awaited<ReturnType<typeof listTodos>>[number]
