import type { Metadata } from "next"
import { IconRefresh } from "@tabler/icons-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatternHeader } from "../_components/pattern-header"
import { CodeBlock } from "../_components/code-block"
import { UsersDataTable } from "../_components/users-data-table"
import { UsersAdvancedDataTable } from "../_components/users-advanced-data-table"
import { readSourceFile } from "../_lib/read-source.server"

export const metadata: Metadata = {
  title: "React Query | Template Playground",
}

const COMPONENT_SOURCE_PATH = "app/(hidden)/test-ui/_components/users-data-table.tsx"
const ACTION_SOURCE_PATH = "app/(hidden)/test-ui/_actions/get-users.ts"

export default async function ReactQueryPatternPage() {
  const [componentSource, actionSource] = await Promise.all([
    readSourceFile(COMPONENT_SOURCE_PATH),
    readSourceFile(ACTION_SOURCE_PATH),
  ])

  return (
    <div>
      <PatternHeader
        avoidWhen={["Data only the initial page render needs"]}
        badge="use client + React Query + nuqs"
        description="A fourth server-boundary shape: a Server Action (get-users.ts) called directly as a React Query queryFn from a Client Component. nuqs owns page, sort, and filter state in the URL; React Query reads that state and owns caching, deduping, and refetch around the call. The Server Action stays the only place that touches data."
        icon={<IconRefresh className="size-5" />}
        title="React Query + nuqs"
        useWhen={[
          "Client needs refetch, pagination, or cache (search, sort, live filter)",
          "Table/list state that should survive refresh or be shareable as a link",
        ]}
      />
      <Tabs defaultValue="simple">
        <TabsList>
          <TabsTrigger value="simple">Data Table</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Toolbar</TabsTrigger>
        </TabsList>
        <TabsContent className="mt-4" value="simple">
          <UsersDataTable />
        </TabsContent>
        <TabsContent className="mt-4" value="advanced">
          <UsersAdvancedDataTable />
        </TabsContent>
      </Tabs>
      <div className="mt-6 space-y-4">
        <CodeBlock code={actionSource} filePath={ACTION_SOURCE_PATH} />
        <CodeBlock code={componentSource} filePath={COMPONENT_SOURCE_PATH} />
      </div>
    </div>
  )
}
