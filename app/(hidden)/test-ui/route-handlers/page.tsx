import type { Metadata } from "next"
import { IconApi } from "@tabler/icons-react"

import { Card, CardContent } from "@/components/ui/card"
import { PatternHeader } from "../_components/pattern-header"
import { CodeBlock } from "../_components/code-block"
import { RouteHandlerDemo } from "../_components/route-handler-demo"
import { readSourceFile } from "../_lib/read-source.server"

export const metadata: Metadata = {
  title: "Route Handler | Template Playground",
}

const SOURCE_PATH = "app/api/test-ui/route.ts"

export default async function RouteHandlerPatternPage() {
  const source = await readSourceFile(SOURCE_PATH)

  return (
    <div>
      <PatternHeader
        avoidWhen={["Internal form mutations by default"]}
        badge="app/api/test-ui/route.ts"
        description="A plain HTTP endpoint. Use it for webhooks, third parties, mobile clients, or a public API contract: any caller that isn't this app's own React UI."
        icon={<IconApi className="size-5" />}
        title="Route Handler"
        useWhen={["Webhooks, third parties, mobile, or a public API"]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <RouteHandlerDemo />
          </CardContent>
        </Card>
        <CodeBlock code={source} filePath={SOURCE_PATH} />
      </div>
    </div>
  )
}
