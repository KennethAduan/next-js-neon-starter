import type { Metadata } from "next"
import Link from "next/link"
import {
  IconApi,
  IconBrandReact,
  IconDatabase,
  IconLock,
  IconRefresh,
  IconServer,
  IconUpload,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Template Playground",
  description: "Internal runnable examples for template patterns and components.",
}

const PATTERNS = [
  {
    href: "/test-ui/server-components",
    icon: IconDatabase,
    title: "Server Component",
    badge: "default",
    description: "Read data with Prisma and render a page. No client fetch, no loading state.",
  },
  {
    href: "/test-ui/server-actions",
    icon: IconServer,
    title: "Server Action",
    badge: "use server",
    description: "A mutation started by this app's own UI, validated and authorized server-side.",
  },
  {
    href: "/test-ui/route-handlers",
    icon: IconApi,
    title: "Route Handler",
    badge: "app/api/**/route.ts",
    description: "A plain HTTP endpoint for webhooks, third parties, mobile, or a public API.",
  },
  {
    href: "/test-ui/client-state",
    icon: IconBrandReact,
    title: "Client Component + Jotai",
    badge: "use client",
    description: "Event handlers and browser state, plus an atom shared across client components.",
  },
  {
    href: "/test-ui/react-query",
    icon: IconRefresh,
    title: "React Query + nuqs",
    badge: "client-side fetch",
    description: "A Server Action used as a queryFn. nuqs syncs page/sort/filter state to the URL.",
  },
  {
    href: "/test-ui/auth",
    icon: IconLock,
    title: "Authentication",
    badge: "Better Auth",
    description: "getServerSession() plus authActionClient, the middleware that rejects unauthenticated calls.",
  },
  {
    href: "/test-ui/file-upload",
    icon: IconUpload,
    title: "File Upload",
    badge: "R2 presigned",
    description: "Presigned upload flow to Cloudflare R2. Only the object key is ever persisted.",
  },
]

export default function TestUIPage() {
  return (
    <div className="space-y-6">
      <article className="typeset typeset-docs max-w-3xl">
        <h2>Pick server boundary</h2>
        <ul>
          <li>
            <strong>Server Component:</strong> read data needed only by the page.
          </li>
          <li>
            <strong>Server Action:</strong> UI-triggered mutation with Zod validation,
            authentication, and authorization.
          </li>
          <li>
            <strong>Route Handler:</strong> webhook, external client, or public HTTP API.
          </li>
        </ul>
        <p>
          Full rules and setup live in{" "}
          <Link className="font-medium hover:underline" href="/docs">
            the rendered documentation
          </Link>
          . This page links to a runnable, source-backed example for each pattern.
        </p>
      </article>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PATTERNS.map((pattern) => (
          <Link
            className="group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={pattern.href}
            key={pattern.href}
          >
            <Card className="h-full ring-1 ring-foreground/10 transition-[transform,box-shadow] group-hover:-translate-y-0.5 group-hover:ring-foreground/25 group-hover:shadow-md">
              <CardHeader>
                <Badge className="w-fit font-mono" variant="secondary">
                  {pattern.badge}
                </Badge>
                <CardTitle className="flex items-center gap-2 font-heading">
                  <pattern.icon className="size-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  {pattern.title}
                </CardTitle>
                <CardDescription>{pattern.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
