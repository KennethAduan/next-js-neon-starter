"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type DemoResult = {
  message: string
  respondedAt: string
  runtime: string
}

export function RouteHandlerDemo() {
  const [message, setMessage] = useState("Hello from fetch")
  const [result, setResult] = useState<DemoResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function callApiRoute() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/test-ui?message=${encodeURIComponent(message)}`)
      const body = (await response.json()) as DemoResult | { error: string }

      if (!response.ok || "error" in body) {
        setResult(null)
        setError("error" in body ? body.error : "API request failed")
        return
      }

      setResult(body)
    } catch {
      setResult(null)
      setError("Could not reach API route")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-message">Query message</Label>
        <Input
          id="api-message"
          maxLength={80}
          onChange={(event) => setMessage(event.target.value)}
          value={message}
        />
      </div>
      <Button
        disabled={message.trim().length === 0}
        isLoading={isLoading}
        onClick={callApiRoute}
        type="button"
        variant="outline"
      >
        Call /api/test-ui
      </Button>
      {result ? (
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground">Run example to see response.</p>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
