import type { Metadata } from "next"
import { IconDatabase } from "@tabler/icons-react"

import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { PatternHeader } from "../_components/pattern-header"
import { CodeBlock } from "../_components/code-block"
import { readSourceFile } from "../_lib/read-source.server"

export const metadata: Metadata = {
  title: "Server Component | Template Playground",
}

const SOURCE_PATH = "app/(hidden)/test-ui/server-components/page.tsx"

export default async function ServerComponentPatternPage() {
  const [clientCount, recentClients, source] = await Promise.all([
    prisma.client.count(),
    prisma.client.findMany({
      select: { id: true, fullName: true, email: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    readSourceFile(SOURCE_PATH),
  ])

  return (
    <div>
      <PatternHeader
        avoidWhen={["Click handlers, useState, or browser APIs"]}
        badge="Server Component (default)"
        description="Pages and layouts are Server Components unless a file starts with 'use client'. Read Prisma directly here and pass only plain, serializable data to interactive children."
        icon={<IconDatabase className="size-5" />}
        title="Server Component"
        useWhen={["Reading data and rendering a page", "Database or secret-dependent reads"]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground">
              This card was rendered on the server with a live Prisma read against the{" "}
              <code>Client</code> model. No client fetch, no loading state.
            </p>
            <p className="text-2xl font-semibold">{clientCount} clients total</p>
            <ul className="space-y-1 text-sm">
              {recentClients.map((client) => (
                <li className="flex items-center justify-between gap-2" key={client.id}>
                  <span>{client.fullName}</span>
                  <span className="text-muted-foreground">{client.email ?? "—"}</span>
                </li>
              ))}
            </ul>
            {recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No clients yet. Create one to see it appear here on next request.
              </p>
            ) : null}
          </CardContent>
        </Card>
        <CodeBlock code={source} filePath={SOURCE_PATH} />
      </div>
    </div>
  )
}
