import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { DocumentationPage } from "@/features/docs/server/documentation.server"

export function MarkdownDocument({
  page,
}: {
  page: DocumentationPage
}) {
  return (
    <article className="typeset typeset-docs max-w-[72ch]">
      <ReactMarkdown
        components={{
          table: ({ children, ...props }) => (
            <div className="typeset-scroll">
              <table {...props}>{children}</table>
            </div>
          ),
        }}
        remarkPlugins={[remarkGfm]}
      >
        {page.content}
      </ReactMarkdown>
    </article>
  )
}
