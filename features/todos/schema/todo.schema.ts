import { z } from "zod"

export const CreateTodoSchema = z.object({
  title: z.string().trim().min(1, { message: "Title is required" }).max(200),
})

export const UpdateTodoTitleSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, { message: "Title is required" }).max(200),
})

export const TodoIdSchema = z.object({
  id: z.string().min(1),
})

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>
export type UpdateTodoTitleInput = z.infer<typeof UpdateTodoTitleSchema>
export type TodoIdInput = z.infer<typeof TodoIdSchema>
