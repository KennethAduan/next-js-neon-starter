"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { onActionError } from "@/lib/action-utils"
import { Button } from "@/components/ui/button"
import { useRouter } from "nextjs-toploader/app"
import { ROUTES } from "@/constants/app.routes"
import { useSetAtom } from "jotai"
import { userAuthAtom } from "@/features/auth/atom/User.auth.atom"
import { authClient } from "@/features/auth/client/auth-client"
import { LogoutAction } from "../actions/login.action"
import { useAction } from "next-safe-action/hooks"
import { sileo } from "sileo"

type LogoutDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const LogoutDialog = ({ open, onOpenChange }: LogoutDialogProps) => {
  const router = useRouter()
  const setUserAuth = useSetAtom(userAuthAtom)
  const { executeAsync: logoutAction, isExecuting } = useAction(LogoutAction, {
    onSuccess: async ({ data }) => {
      if (data?.success) {
        // Cookie may already be cleared by LogoutAction; ignore client errors.
        await authClient.signOut().catch(() => undefined)
        onOpenChange(false)
        setUserAuth(null)
        router.replace(ROUTES.HOME)
      } else {
        sileo.error({ title: data?.message ?? "Logout failed" })
      }
    },
    onError: onActionError,
  })

  const handleLogout = async () => {
    // Server first — still has session cookie. Client sign-out first makes
    // proxy redirect the action POST (protected path → /login HTML) and
    // yields "An unexpected response was received from the server."
    try {
      await logoutAction()
    } catch {
      sileo.error({ title: "Logout failed" })
    }
  }
  const handleCancel = () => {
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            Logout
          </DialogTitle>
          <DialogDescription className="text-center">
            Are you sure you want to logout? This action will sign you out of
            your account and you will need to login again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={isExecuting}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button isLoading={isExecuting} onClick={handleLogout}>
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default LogoutDialog
