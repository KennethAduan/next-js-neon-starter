import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import React, { useMemo, useState } from "react"
import NavMainMenuItem from "./NavMainMenuItem"
import { resolveOpenByUrl, withActiveGroups, type NavMainGroupWithActive } from "./nav-main.utils"
import type { TablerIcon } from "@tabler/icons-react"

type NavMainSubItem = {
  title: string
  url: string
  isActive?: boolean
}

export type NavMainItem = {
  title: string
  url: string
  icon?: TablerIcon
  isActive?: boolean
  items?: NavMainSubItem[]
}

export type NavMainGroup = {
  label: string
  items: NavMainItem[]
}

type NavMainProps = {
  groups: NavMainGroup[]
  pathname: string
}

const NavMain = ({ groups, pathname }: NavMainProps) => {
  const [openByUrl, setOpenByUrl] = useState<Record<string, boolean>>({})

  const groupsWithActive = useMemo(
    (): NavMainGroupWithActive[] => withActiveGroups(groups, pathname),
    [groups, pathname]
  )

  const resolvedOpenByUrl = useMemo(
    () => resolveOpenByUrl(groupsWithActive, openByUrl),
    [groupsWithActive, openByUrl]
  )

  return (
    <>
      {groupsWithActive.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu className="gap-2">
            {group.items.map((item) => (
              <NavMainMenuItem
                key={item.title}
                item={item}
                isOpen={resolvedOpenByUrl[item.url] ?? Boolean(item.isActive)}
                onOpenChange={(isOpen) =>
                  setOpenByUrl((previous) => ({
                    ...previous,
                    [item.url]: isOpen,
                  }))
                }
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

export default NavMain
