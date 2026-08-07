import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import AppSidebar from "@/features/sidebar/AppSidebar"
import { Separator } from "@base-ui/react"
import React, { Suspense } from "react"
import { getServerSession } from "@/features/auth/server/session.server"
import { ROUTES } from "@/constants/app.routes"
import { redirect } from "next/navigation"
import BreadcrumbSidebar from "@/features/sidebar/BreadcrumbSidebar"
import { ThemeToggle } from "@/components/ThemeToggle"

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession()
  if (!session) {
    redirect(ROUTES.LOGIN)
  }
  return (
    <Suspense>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-7"
                />
                <BreadcrumbSidebar />
              </div>
              <div className="flex items-center gap-2 px-4">
                <ThemeToggle />
              </div>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </Suspense>
  )
}

export default ProtectedLayout
