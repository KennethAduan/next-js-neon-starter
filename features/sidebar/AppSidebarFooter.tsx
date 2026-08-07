"use client"

import { SidebarFooter } from "@/components/ui/sidebar"
import { UserWithoutPassword } from "@/features/users/schema/user.schema"
import { useAtomValue } from "jotai"
import { userAuthAtom } from "../auth/atom/User.auth.atom"
import { NavUser } from "./NavUser"

const DEFAULT_AVATAR = "https://github.com/shadcn.png"

function toNavUser(user: UserWithoutPassword | null) {
  if (!user) {
    return { name: "", email: "", avatar: DEFAULT_AVATAR }
  }

  return {
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email ?? "",
    avatar: user.photoURL ?? DEFAULT_AVATAR,
  }
}

const AppSidebarFooter = () => {
  const user = useAtomValue(userAuthAtom)

  return (
    <SidebarFooter>
      <NavUser user={toNavUser(user)} />
    </SidebarFooter>
  )
}

export default AppSidebarFooter
