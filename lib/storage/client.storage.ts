"use client";

import { compressImageForUpload } from "@/lib/storage/compress-image.client";
import type {
  ImageCompressionOptions,
  ImageCompressionPreset,
} from "@/lib/storage/compress-image.client";
import { createUploadIntentAction } from "@/lib/storage/upload.action";

type UploadOptions = {
  contentType?: string;
  /** Default true. Set false to upload the raw File (for example GIF). */
  compress?: boolean;
  /** Preset name or custom overrides. Default: `avatar`. */
  compression?: ImageCompressionPreset | ImageCompressionOptions;
};

async function prepareUploadFile(
  file: File,
  options?: UploadOptions,
): Promise<File> {
  if (options?.compress === false) return file;

  return compressImageForUpload(file, options?.compression);
}

function getContentType(file: File, options?: UploadOptions): string {
  return options?.contentType || file.type || "application/octet-stream";
}

function getFileExtension(file: File): string {
  return file.name.split(".").pop() ?? "bin";
}

async function requestUploadIntent(file: File, contentType: string) {
  const result = await createUploadIntentAction({
    contentType: contentType as
      "image/jpeg" | "image/png" | "image/webp" | "image/gif",
    contentLength: file.size,
    folder: "users",
    extension: getFileExtension(file),
  });

  if (!result?.data?.success) {
    throw new Error(result?.serverError ?? "Failed to create upload intent");
  }

  return result.data;
}

async function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  contentType: string,
) {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }
}

/**
 * Upload to Cloudflare R2 via presigned PUT.
 * Returns the object key — persist that in the DB, not a public URL.
 */
export async function uploadFile(
  file: File,
  _legacyPath: string,
  options?: UploadOptions,
): Promise<string> {
  const preparedFile = await prepareUploadFile(file, options);
  const contentType = getContentType(preparedFile, options);
  const { uploadUrl, key } = await requestUploadIntent(
    preparedFile,
    contentType,
  );
  await uploadToPresignedUrl(uploadUrl, preparedFile, contentType);

  return key;
}
