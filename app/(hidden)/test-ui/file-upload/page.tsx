import type { Metadata } from "next"
import { IconUpload } from "@tabler/icons-react"

import { PatternHeader } from "../_components/pattern-header"
import { CodeBlock } from "../_components/code-block"
import { FileUploadDemo } from "../_components/file-upload-demo"
import { readSourceFile } from "../_lib/read-source.server"

export const metadata: Metadata = {
  title: "File Upload | Template Playground",
}

const UPLOAD_ACTION_PATH = "lib/storage/upload.action.ts"
const CLIENT_HELPER_PATH = "lib/storage/client.storage.ts"
const DELETE_ACTION_PATH = "app/(hidden)/test-ui/_actions/delete-test-upload.action.ts"

export default async function FileUploadPatternPage() {
  const [uploadActionSource, clientHelperSource, deleteActionSource] = await Promise.all([
    readSourceFile(UPLOAD_ACTION_PATH),
    readSourceFile(CLIENT_HELPER_PATH),
    readSourceFile(DELETE_ACTION_PATH),
  ])

  return (
    <div>
      <PatternHeader
        avoidWhen={["Storing binary bytes in Postgres, public unsigned URLs"]}
        badge="R2 presigned upload"
        description="Client requests a short-lived, key-scoped upload intent from a Server Action, then PUTs the file directly to R2. Only the object key is ever persisted, never the signed URL or R2 credentials. This demo uploads into your own users/ prefix and can delete it again."
        icon={<IconUpload className="size-5" />}
        title="File Upload"
        useWhen={["Any private or user-owned binary file", "Avatar, document, or attachment uploads"]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <FileUploadDemo />
        <div className="space-y-4">
          <CodeBlock code={clientHelperSource} filePath={CLIENT_HELPER_PATH} />
          <CodeBlock code={uploadActionSource} filePath={UPLOAD_ACTION_PATH} />
          <CodeBlock code={deleteActionSource} filePath={DELETE_ACTION_PATH} />
        </div>
      </div>
    </div>
  )
}
