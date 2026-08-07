"use client"

import { useEffect, useRef } from "react"
import { useQueryState, parseAsString } from "nuqs"
import { useSetAtom } from "jotai"
import { sileo } from "sileo"
import { authClient } from "@/features/auth/client/auth-client"
import { userAuthAtom } from "@/features/auth/atom/User.auth.atom"
import {
  SESSION_EXPIRED_QUERY_PARAM,
  SESSION_EXPIRED_REASON,
} from "@/features/auth/auth.routes"

export function useExpiredSessionHandler() {
  const setUserAuth = useSetAtom(userAuthAtom)
  const [reason, setReason] = useQueryState(
    SESSION_EXPIRED_QUERY_PARAM,
    parseAsString
  )
  const hasHandledExpiredSession = useRef(false)

  useEffect(() => {
    if (reason !== SESSION_EXPIRED_REASON || hasHandledExpiredSession.current) {
      return
    }

    hasHandledExpiredSession.current = true

    const handleExpiredSession = async () => {
      setUserAuth(null)
      await authClient.signOut().catch(() => undefined)
      sileo.error({
        title: "Your session has expired. Please log in again.",
      })
      await setReason(null)
    }

    void handleExpiredSession()
  }, [reason, setReason, setUserAuth])
}
