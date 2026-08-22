"use client"

import { useState } from "react"
import { useAction } from "next-safe-action/hooks"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { runStackPlaygroundAction } from "../_actions/stack-playground.action"

export function ServerActionDemo() {
  const [message, setMessage] = useState("Hello from browser")
  const { executeAsync, isExecuting, result } = useAction(runStackPlaygroundAction)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="server-message">Message</Label>
        <Input
          id="server-message"
          maxLength={80}
          onChange={(event) => setMessage(event.target.value)}
          value={message}
        />
      </div>
      <Button
        disabled={message.trim().length === 0}
        isLoading={isExecuting}
        onClick={() => executeAsync({ message })}
        type="button"
      >
        Run Server Action
      </Button>
      {result.data ? (
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
          {JSON.stringify(result.data, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground">Run example to see response.</p>
      )}
      {result.serverError ? (
        <p className="text-sm text-destructive">{result.serverError}</p>
      ) : null}
    </div>
  )
}
