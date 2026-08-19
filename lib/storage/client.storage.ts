"use client"

import { compressImageForUpload } from "@/lib/storage/compress-image.client"
import type {
  ImageCompressionOptions,
  ImageCompressionPreset,
} from "@/lib/storage/compress-image.client"
import { createUploadIntentAction } from "@/lib/storage/upload.action"

type UploadOptions = {
  contentType?: string
  /** Default true. Set false to upload the raw File (for example GIF). */
  compress?: boolean
  /** Preset name or custom overrides. Default: `avatar`. */
  compression?: ImageCompressionPreset | ImageCompressionOptions
}

/**
 * Upload to Cloudflare R2 via presigned PUT.
 * Returns the object key — persist that in the DB, not a public URL.
 */
export async function uploadFile(
  file: File,
  _legacyPath: string,
  options?: UploadOptions
): Promise<string> {
  const shouldCompress = options?.compress !== false
  const preparedFile = shouldCompress
    ? await compressImageForUpload(file, options?.compression)
    : file

  const contentType =
    options?.contentType || preparedFile.type || "application/octet-stream"
  const extension = preparedFile.name.split(".").pop() ?? "bin"

  const result = await createUploadIntentAction({
    contentType: contentType as
      | "image/jpeg"
      | "image/png"
      | "image/webp"
      | "image/gif",
    contentLength: preparedFile.size,
    folder: "users",
    extension,
  })

  if (!result?.data?.success) {
    throw new Error(result?.serverError ?? "Failed to create upload intent")
  }

  const { uploadUrl, key } = result.data
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: preparedFile,
    headers: {
      "Content-Type": contentType,
    },
  })

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`)
  }

  return key
}
