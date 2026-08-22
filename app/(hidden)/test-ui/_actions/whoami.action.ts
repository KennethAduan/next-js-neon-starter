"use server"

import { ActionError, actionClient, authActionClient } from "@/lib/safe.action"

/** Public: runs for anyone, signed in or not. */
export const publicPingAction = actionClient
  .metadata({ actionName: "publicPing" })
  .action(async () => {
    return { message: "Public action ran. No session required.", runtime: "actionClient" }
  })

/** Protected: authActionClient's middleware rejects before this body runs if there is no session. */
export const whoAmIAction = authActionClient
  .metadata({ actionName: "whoAmI" })
  .action(async ({ ctx }) => {
    if (!ctx.session?.user.id) {
      throw new ActionError("Unauthorized")
    }

    return {
      userId: ctx.session.user.id,
      email: ctx.session.user.email,
      runtime: "authActionClient",
    }
  })
