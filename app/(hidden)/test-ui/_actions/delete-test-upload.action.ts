"use server"

import { z } from "zod"
import { ActionError, authActionClient } from "@/lib/safe.action"
import { deleteObject } from "@/lib/storage/r2.server"

const DeleteTestUploadSchema = z.object({
  key: z.string().trim().min(1),
})

/** Demo cleanup only. Only deletes a key inside the caller's own users/ prefix. */
export const deleteTestUploadAction = authActionClient
  .metadata({ actionName: "deleteTestUpload" })
  .inputSchema(DeleteTestUploadSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.session?.user.id) {
      throw new ActionError("Unauthorized")
    }

    const ownPrefix = `users/${ctx.session.user.id}/`
    if (!parsedInput.key.startsWith(ownPrefix)) {
      throw new ActionError("Cannot delete a key outside your own uploads")
    }

    await deleteObject(parsedInput.key)

    return { success: true as const }
  })
