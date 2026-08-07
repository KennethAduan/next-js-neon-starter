"use client"

import { createUploadIntentAction } from "@/lib/storage/upload.action"

type UploadOptions = {
  contentType?: string
}

/**
 * Request short-lived R2 upload intent, then PUT file directly to R2.
 */
export async function uploadFile(
  file: File,
  _legacyPath: string,
  options?: UploadOptions
): Promise<string> {
  const contentType = options?.contentType || file.type || "application/octet-stream"
  const extension = file.name.split(".").pop() ?? "bin"

  const result = await createUploadIntentAction({
    contentType: contentType as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/gif",
    contentLength: file.size,
    folder: "users",
    extension,
  })

  if (!result?.data?.success) {
    throw new Error(result?.serverError ?? "Failed to create upload intent")
  }

  const { uploadUrl, publicUrl } = result.data
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType,
    },
  })

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`)
  }

  return publicUrl
}
