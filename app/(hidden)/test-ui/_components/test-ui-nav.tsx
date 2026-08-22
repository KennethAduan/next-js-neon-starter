"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/test-ui", label: "Overview" },
  { href: "/test-ui/server-components", label: "Server Component" },
  { href: "/test-ui/server-actions", label: "Server Action" },
  { href: "/test-ui/route-handlers", label: "Route Handler" },
  { href: "/test-ui/client-state", label: "Client + Jotai" },
  { href: "/test-ui/react-query", label: "React Query" },
  { href: "/test-ui/auth", label: "Auth" },
  { href: "/test-ui/file-upload", label: "File Upload" },
]

export function TestUiNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-wrap items-center gap-1 border-b pb-3">
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href

        return (
          <Link
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        )
      })}
      <Link
        className="ml-auto rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        href="/docs"
      >
        Rendered documentation
      </Link>
    </nav>
  )
}
