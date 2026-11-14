import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { ROUTES } from "@/constants"
import { IconChecklist } from "@tabler/icons-react"
import Link from "next/link"

const AppSidebarHeader = () => {
  return (
    <SidebarHeader>
      <SidebarMenu size="compact">
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            tooltip="Team Todos"
            render={<Link href={ROUTES.HOME} className="w-full" />}
          >
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-brand-foreground">
              <IconChecklist className="size-4" aria-hidden />
            </div>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-base font-semibold tracking-tight text-foreground">
                Team Todos
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}

export default AppSidebarHeader
