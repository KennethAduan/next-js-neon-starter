"use server"

import { actionClient } from "@/lib/safe.action"
import { z } from "zod"

const StackPlaygroundInputSchema = z.object({
  message: z.string().trim().min(1).max(80),
})

/** Safe internal demo. Production mutations also need authorization. */
export const runStackPlaygroundAction = actionClient
  .metadata({ actionName: "runStackPlayground" })
  .inputSchema(StackPlaygroundInputSchema)
  .action(async ({ parsedInput }) => {
    return {
      message: parsedInput.message,
      ranAt: new Date().toISOString(),
      runtime: "Server Action",
    }
  })
