import type { Metadata } from "next"
import { IconServer } from "@tabler/icons-react"

import { Card, CardContent } from "@/components/ui/card"
import { PatternHeader } from "../_components/pattern-header"
import { CodeBlock } from "../_components/code-block"
import { ServerActionDemo } from "../_components/server-action-demo"
import { readSourceFile } from "../_lib/read-source.server"

export const metadata: Metadata = {
  title: "Server Action | Template Playground",
}

const SOURCE_PATH = "app/(hidden)/test-ui/_actions/stack-playground.action.ts"

export default async function ServerActionPatternPage() {
  const source = await readSourceFile(SOURCE_PATH)

  return (
    <div>
      <PatternHeader
        avoidWhen={["Webhooks, mobile clients, or public HTTP contracts"]}
        badge="use server"
        description="A mutation started by this app's own UI. Runs on the server, so Prisma and Better Auth session checks stay server-side. Called through next-safe-action's useAction hook."
        icon={<IconServer className="size-5" />}
        title="Server Action"
        useWhen={["Authenticated form or button mutation from this app's React UI"]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <ServerActionDemo />
          </CardContent>
        </Card>
        <CodeBlock code={source} filePath={SOURCE_PATH} />
      </div>
    </div>
  )
}
