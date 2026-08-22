import type { Metadata } from "next"
import { IconBrandReact } from "@tabler/icons-react"

import { Card, CardContent } from "@/components/ui/card"
import { PatternHeader } from "../_components/pattern-header"
import { CodeBlock } from "../_components/code-block"
import { ClientStateDemo } from "../_components/client-state-demo"
import { readSourceFile } from "../_lib/read-source.server"

export const metadata: Metadata = {
  title: "Client Component + Jotai | Template Playground",
}

const COMPONENT_SOURCE_PATH = "app/(hidden)/test-ui/_components/client-state-demo.tsx"
const ATOM_SOURCE_PATH = "app/(hidden)/test-ui/_atoms/stack-playground.atom.ts"

export default async function ClientStatePatternPage() {
  const [componentSource, atomSource] = await Promise.all([
    readSourceFile(COMPONENT_SOURCE_PATH),
    readSourceFile(ATOM_SOURCE_PATH),
  ])

  return (
    <div>
      <PatternHeader
        avoidWhen={["Prisma, secrets, or direct authorization decisions"]}
        badge="use client + Jotai"
        description="Event handlers and browser state make this a Client Component, so it ships to the browser. Jotai atoms share temporary UI state, like this counter, across client components without touching the database."
        icon={<IconBrandReact className="size-5" />}
        title="Client Component + Jotai"
        useWhen={["Forms, events, local state, browser APIs", "Shared temporary browser UI state"]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <ClientStateDemo />
          </CardContent>
        </Card>
        <div className="space-y-4">
          <CodeBlock code={atomSource} filePath={ATOM_SOURCE_PATH} />
          <CodeBlock code={componentSource} filePath={COMPONENT_SOURCE_PATH} />
        </div>
      </div>
    </div>
  )
}
