import type { Metadata } from "next"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersAdvancedDataTable } from "./_components/users-advanced-data-table"
import { UsersDataTable } from "./_components/users-data-table"
import { StackPlayground } from "./_components/stack-playground"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Template Playground",
  description: "Internal runnable examples for template patterns and components.",
}

export default function TestUIPage() {
  return (
    <Suspense>
      <div className="container px-4 py-8">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold">Template Playground</h1>
          <p className="text-sm text-muted-foreground">
            Runnable examples for junior developer KT. Read source beside each example.
          </p>
          <p className="text-xs text-muted-foreground">
            Source: <code>app/(hidden)/test-ui/_actions/stack-playground.action.ts</code>,{" "}
            <code>app/api/test-ui/route.ts</code>,{" "}
            <code>app/(hidden)/test-ui/_components/stack-playground.tsx</code>
          </p>
          <Link className="text-sm font-medium hover:underline" href="/docs">
            Open rendered documentation
          </Link>
        </div>
        <Tabs defaultValue="stack-patterns">
          <TabsList>
            <TabsTrigger value="stack-patterns">Stack Patterns</TabsTrigger>
            <TabsTrigger value="reading-guide">Reading Guide</TabsTrigger>
            <TabsTrigger value="datatable">Data Table</TabsTrigger>
            <TabsTrigger value="datatable-advanced">Advanced Toolbar</TabsTrigger>
          </TabsList>
          <TabsContent value="stack-patterns" className="mt-4">
            <StackPlayground />
          </TabsContent>
          <TabsContent value="reading-guide" className="mt-4">
            <article className="typeset typeset-docs max-w-3xl">
              <h1>Template Stack Reading Guide</h1>
              <p>
                Use this page for runnable examples. Use <code>docs/TECHNOLOGY_STACK.md</code>{" "}
                for rules, setup, and release guidance.
              </p>

              <h2>Pick server boundary</h2>
              <ul>
                <li>
                  <strong>Server Component:</strong> read data needed only by page.
                </li>
                <li>
                  <strong>Server Action:</strong> UI-triggered mutation with Zod validation,
                  authentication, and authorization.
                </li>
                <li>
                  <strong>Route Handler:</strong> webhook, external client, or public HTTP API.
                </li>
              </ul>

              <h2>Keep browser code small</h2>
              <p>
                Add <code>&quot;use client&quot;</code> only at interactive boundary. Use it for event
                handlers, browser APIs, and client state. Never import Prisma, Better Auth
                server config, or R2 credentials into it.
              </p>

              <h2>Use Jotai for UI state</h2>
              <p>
                Jotai owns shared client-only UI state: open dialogs, local filters, and
                temporary workflow steps. Prisma remains system of record.
              </p>

              <pre>
                <code>{`const countAtom = atom(0)
const [count, setCount] = useAtom(countAtom)`}</code>
              </pre>

              <h2>Production mutation checklist</h2>
              <ol>
                <li>Validate input with Zod on server.</li>
                <li>Read session from Better Auth, never browser-supplied user id.</li>
                <li>Check ownership, organization, or role before query or write.</li>
                <li>Return only plain data UI needs.</li>
              </ol>

              <blockquote>
                Read HTML and rendered Markdown inside <code>typeset typeset-docs</code>.
                Add <code>not-typeset</code> to exclude interactive UI from document styles.
              </blockquote>
            </article>
          </TabsContent>
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
