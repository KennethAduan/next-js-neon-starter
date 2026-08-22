import { codeToHtml } from "shiki"
import { CopyButton } from "./copy-button"

function langFromFilePath(filePath: string): string {
  if (filePath.endsWith(".tsx")) return "tsx"
  if (filePath.endsWith(".ts")) return "ts"
  return "text"
}

export async function CodeBlock({ code, filePath }: { code: string; filePath: string }) {
  const html = await codeToHtml(code, {
    lang: langFromFilePath(filePath),
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  })

  return (
    <div className="overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-2 rounded-t-xl border-b bg-muted/50 px-4 py-2">
        <code className="truncate font-mono text-xs text-muted-foreground">{filePath}</code>
        <CopyButton code={code} />
      </div>
      <div
        className="overflow-x-auto [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-xs [&_pre]:leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
