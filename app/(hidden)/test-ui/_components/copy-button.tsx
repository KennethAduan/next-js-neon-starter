"use client"

import { useState } from "react"
import { IconCheck, IconCopy } from "@tabler/icons-react"
import { sileo } from "sileo"
import { Button } from "@/components/ui/button"

export function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    sileo.success({ title: "Copied to clipboard" })
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button
      aria-label="Copy code"
      className="size-7"
      onClick={handleCopy}
      size="icon"
      type="button"
      variant="ghost"
    >
      {copied ? <IconCheck className="size-4" /> : <IconCopy className="size-4" />}
    </Button>
  )
}
