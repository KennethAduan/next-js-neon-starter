import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { ROUTES } from "@/constants"
import Image from "next/image"
import Link from "next/link"
const AppSidebarHeader = () => {
  return (
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            tooltip="Firebase Starter"
            render={<Link href={ROUTES.HOME} className="w-full" />}
          >
            <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg">
              <Image
                src="/main_logo.png"
                alt="Firebase Starter"
                width={32}
                height={32}
              />
            </div>
            <div className="grid flex-1 text-center leading-tight group-data-[collapsible=icon]:hidden">
              <span className="text-lg font-bold text-primary">
                Firebase Starter
              </span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  )
}

export default AppSidebarHeader
