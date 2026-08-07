import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { nanoid } from "nanoid"
import { env } from "@/config/env"

const UPLOAD_URL_EXPIRES_IN = 60 * 5
/** Long enough for local/dev avatar display without constant refresh. */
const DOWNLOAD_URL_EXPIRES_IN = 60 * 60 * 24 * 7

function getR2Client() {
  return new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
    // Browser PUT cannot send AWS SDK flexible checksum headers.
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
  })
}

export function buildObjectKey(parts: {
  folder: string
  userId: string
  extension: string
}) {
  const safeExt = parts.extension.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10) || "bin"
  return `${parts.folder}/${parts.userId}/${nanoid()}.${safeExt}`
}

/** Browser-ready Cloudflare URL via signed GET on *.r2.cloudflarestorage.com. */
export async function resolveObjectReadUrl(key: string): Promise<string> {
  const { downloadUrl } = await createPresignedDownloadUrl(key)
  return downloadUrl
}

export async function createPresignedUploadUrl(options: {
  key: string
  contentType: string
  contentLength?: number
}) {
  const client = getR2Client()
  // Sign only Content-Type + host so browser PUT matches signature.
  // Do not bind Content-Length — fetch sets it, but signing it is brittle.
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: options.key,
    ContentType: options.contentType,
  })

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: UPLOAD_URL_EXPIRES_IN,
    signableHeaders: new Set(["content-type"]),
  })

  return {
    uploadUrl,
    key: options.key,
    expiresIn: UPLOAD_URL_EXPIRES_IN,
  }
}

export async function createPresignedDownloadUrl(key: string) {
  const client = getR2Client()
  const command = new GetObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
  })

  const downloadUrl = await getSignedUrl(client, command, {
    expiresIn: DOWNLOAD_URL_EXPIRES_IN,
  })

  return { downloadUrl, expiresIn: DOWNLOAD_URL_EXPIRES_IN }
}

export async function deleteObject(key: string) {
  const client = getR2Client()
  await client.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET,
      Key: key,
    })
  )
}
