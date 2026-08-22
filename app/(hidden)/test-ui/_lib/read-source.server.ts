import { readFile } from "node:fs/promises"
import path from "node:path"

const REPO_ROOT = process.cwd()

/** Reads a repo-relative source file so KT pages can show the code that is actually running. */
export async function readSourceFile(relativePath: string): Promise<string> {
  const content = await readFile(path.join(REPO_ROOT, relativePath), "utf8")
  return content.trimEnd()
}
