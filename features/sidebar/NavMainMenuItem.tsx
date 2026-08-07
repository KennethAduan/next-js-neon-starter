import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { IconChevronRight, TablerIcon } from "@tabler/icons-react"
import Link from "next/link"
import type { NavMainItemWithActive } from "./nav-main.utils"

type NavMainMenuItemProps = {
  item: NavMainItemWithActive
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}

function NavItemLabel({
  icon: Icon,
  title,
}: {
  icon?: TablerIcon
  title: string
}) {
  return (
    <>
      {Icon ? <Icon /> : null}
      <span>{title}</span>
    </>
  )
}

function NavMainSubMenu({
  items,
}: {
  items: NonNullable<NavMainItemWithActive["items"]>
}) {
  return (
    <SidebarMenuSub>
      {items.map((subItem) => (
        <SidebarMenuSubItem key={subItem.title}>
          <SidebarMenuSubButton
            isActive={subItem.isActive}
            render={<Link href={subItem.url} />}
          >
            <span>{subItem.title}</span>
          </SidebarMenuSubButton>
        </SidebarMenuSubItem>
      ))}
    </SidebarMenuSub>
  )
}

const NavMainMenuItem = ({
  item,
  isOpen,
  onOpenChange,
}: NavMainMenuItemProps) => {
  const hasChildren = Boolean(item.items?.length)

  return (
    <SidebarMenuItem>
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        {hasChildren ? (
          <CollapsibleTrigger
            render={
              <SidebarMenuButton isActive={item.isActive} tooltip={item.title} />
            }
          >
            <NavItemLabel icon={item.icon} title={item.title} />
          </CollapsibleTrigger>
        ) : (
          <SidebarMenuButton
            isActive={item.isActive}
            render={<Link href={item.url} />}
            tooltip={item.title}
          >
            <NavItemLabel icon={item.icon} title={item.title} />
          </SidebarMenuButton>
        )}
        {hasChildren ? (
          <>
            <CollapsibleTrigger
              render={
                <SidebarMenuAction className="aria-expanded:rotate-90" />
              }
            >
              <IconChevronRight />
              <span className="sr-only">Toggle</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <NavMainSubMenu items={item.items!} />
            </CollapsibleContent>
          </>
        ) : null}
      </Collapsible>
    </SidebarMenuItem>
  )
}

export default NavMainMenuItem
