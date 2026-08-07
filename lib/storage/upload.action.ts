"use server"

import { z } from "zod"
import { ActionError, authActionClient } from "@/lib/safe.action"
import {
  buildObjectKey,
  createPresignedUploadUrl,
} from "@/lib/storage/r2.server"

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const

const CreateUploadIntentSchema = z.object({
  contentType: z.enum(ALLOWED_IMAGE_TYPES),
  contentLength: z.number().int().positive().max(MAX_UPLOAD_BYTES),
  folder: z.enum(["users"]),
  extension: z.string().min(1).max(10),
})

export const createUploadIntentAction = authActionClient
  .metadata({ actionName: "createUploadIntent" })
  .inputSchema(CreateUploadIntentSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.session?.user.id) {
      throw new ActionError("Unauthorized")
    }

    const key = buildObjectKey({
      folder: parsedInput.folder,
      userId: ctx.session.user.id,
      extension: parsedInput.extension,
    })

    const intent = await createPresignedUploadUrl({
      key,
      contentType: parsedInput.contentType,
      contentLength: parsedInput.contentLength,
    })

    return { success: true as const, ...intent }
  })
