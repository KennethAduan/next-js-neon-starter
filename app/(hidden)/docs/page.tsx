import type { Metadata } from "next"
import Link from "next/link"
import { MarkdownDocument } from "@/features/docs/components/MarkdownDocument"
import { getTechnologyStackDocument } from "@/features/docs/server/documentation.server"

export const metadata: Metadata = {
  title: "Documentation",
  description: "Repository documentation rendered from Markdown.",
}

export default async function DocumentationPage() {
  const document = await getTechnologyStackDocument()

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="font-mono text-xs text-muted-foreground">docs/{document.filePath}</p>
        <Link className="text-sm font-medium hover:underline" href="/test-ui">
          Open runnable playground
        </Link>
      </div>
      <MarkdownDocument page={document} />
    </main>
  )
}
