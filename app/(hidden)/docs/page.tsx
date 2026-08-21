import type { Metadata } from "next"
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
      <p className="mb-6 font-mono text-xs text-muted-foreground">
        docs/{document.filePath}
      </p>
      <MarkdownDocument page={document} />
    </main>
  )
}
