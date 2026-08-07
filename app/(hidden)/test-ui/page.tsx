import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersAdvancedDataTable } from "./_components/users-advanced-data-table"
import { UsersDataTable } from "./_components/users-data-table"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Component Showcase",
  description: "Internal showcase for template UI components.",
}

export default function TestUIPage() {
  return (
    <Suspense>
      <div className="container px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold">Component Showcase</h1>
        <Tabs defaultValue="datatable">
          <TabsList>
            <TabsTrigger value="datatable">Data Table</TabsTrigger>
            <TabsTrigger value="datatable-advanced">Advanced Toolbar</TabsTrigger>
          </TabsList>
          <TabsContent value="datatable" className="mt-4">
            <UsersDataTable />
          </TabsContent>
          <TabsContent value="datatable-advanced" className="mt-4">
            <UsersAdvancedDataTable />
          </TabsContent>
        </Tabs>
      </div>
    </Suspense>
  )
}
