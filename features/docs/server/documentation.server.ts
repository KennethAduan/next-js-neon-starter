import { readFile } from "node:fs/promises"
import path from "node:path"

const DOCS_DIRECTORY = path.join(process.cwd(), "docs")
const TECHNOLOGY_STACK_FILE_PATH = "TECHNOLOGY_STACK.md"

export type DocumentationPage = {
  content: string
  filePath: string
  title: string
}

function markdownTitle(content: string, filePath: string): string {
  const heading = content.match(/^#\s+(.+)$/m)?.[1]?.trim()
  return heading ?? path.basename(filePath, ".md").replaceAll("_", " ")
}

/** The docs route deliberately renders only the technology guide. */
export async function getTechnologyStackDocument(): Promise<DocumentationPage> {
  const content = await readFile(
    path.join(DOCS_DIRECTORY, TECHNOLOGY_STACK_FILE_PATH),
    "utf8"
  )

  return {
    content,
    filePath: TECHNOLOGY_STACK_FILE_PATH,
    title: markdownTitle(content, TECHNOLOGY_STACK_FILE_PATH),
  }
}
