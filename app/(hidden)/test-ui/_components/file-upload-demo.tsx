"use client"

import { useState, type ChangeEvent } from "react"
import { useAction } from "next-safe-action/hooks"
import { IconTrash, IconUpload } from "@tabler/icons-react"

import {
  Attachment,
  AttachmentActions,
  AttachmentAction,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentTrigger,
} from "@/components/ui/attachment"
import { uploadFile } from "@/lib/storage/client.storage"
import { deleteTestUploadAction } from "../_actions/delete-test-upload.action"

type Status = "idle" | "uploading" | "done" | "error"

export function FileUploadDemo() {
  const [status, setStatus] = useState<Status>("idle")
  const [objectKey, setObjectKey] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { executeAsync: executeDelete, isExecuting: isDeleting } =
    useAction(deleteTestUploadAction)

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setStatus("uploading")
    setError(null)
    setFileName(file.name)
    setPreviewUrl(URL.createObjectURL(file))

    try {
      const key = await uploadFile(file, "unused-legacy-path", { compression: "avatar" })
      setObjectKey(key)
      setStatus("done")
    } catch {
      setError("Upload failed. Confirm R2 credentials are configured in .env.local.")
      setStatus("error")
    }
  }

  async function handleDelete() {
    if (!objectKey) return
    const result = await executeDelete({ key: objectKey })
    if (result?.data?.success) {
      reset()
    }
  }

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setStatus("idle")
    setObjectKey(null)
    setPreviewUrl(null)
    setFileName(null)
    setError(null)
  }

  return (
    <div className="space-y-3">
      <Attachment orientation="vertical" state={status}>
        {previewUrl ? (
          <AttachmentMedia variant="image">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={fileName ?? "Upload preview"} src={previewUrl} />
          </AttachmentMedia>
        ) : (
          <AttachmentMedia variant="icon">
            <IconUpload />
          </AttachmentMedia>
        )}
        <AttachmentContent>
          <AttachmentTitle>
            {status === "idle" && "Choose an image"}
            {status === "uploading" && "Uploading..."}
            {status === "done" && (fileName ?? "Uploaded")}
            {status === "error" && "Upload failed"}
          </AttachmentTitle>
          <AttachmentDescription>
            {status === "idle" && "JPEG, PNG, WEBP, or GIF"}
            {status === "uploading" && "Requesting presigned URL and putting to R2"}
            {status === "done" && objectKey}
            {status === "error" && error}
          </AttachmentDescription>
        </AttachmentContent>
        {status === "idle" || status === "error" ? (
          <AttachmentTrigger
            className="cursor-pointer opacity-0"
            render={
              <input
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileChange}
                type="file"
              />
            }
          />
        ) : null}
        {status === "done" ? (
          <AttachmentActions>
            <AttachmentAction
              aria-label="Delete test upload"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              <IconTrash />
            </AttachmentAction>
          </AttachmentActions>
        ) : null}
      </Attachment>
    </div>
  )
}
