"use client"

import { useState } from "react"
import { useAtom } from "jotai"
import { useAction } from "next-safe-action/hooks"
import {
  IconApi,
  IconArrowDown,
  IconArrowUp,
  IconBrandReact,
  IconServer,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { runStackPlaygroundAction } from "../_actions/stack-playground.action"
import { stackPlaygroundCountAtom } from "../_atoms/stack-playground.atom"

type DemoResult = {
  message: string
  ranAt?: string
  respondedAt?: string
  runtime: string
}

function Result({ result }: { result: DemoResult | null }) {
  if (!result) {
    return <p className="text-sm text-muted-foreground">Run example to see response.</p>
  }

  return (
    <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
      {JSON.stringify(result, null, 2)}
    </pre>
  )
}

export function StackPlayground() {
  const [serverMessage, setServerMessage] = useState("Hello from browser")
  const [apiMessage, setApiMessage] = useState("Hello from fetch")
  const [apiResult, setApiResult] = useState<DemoResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isCallingApi, setIsCallingApi] = useState(false)
  const [count, setCount] = useAtom(stackPlaygroundCountAtom)
  const { executeAsync, isExecuting, result } = useAction(runStackPlaygroundAction)

  async function callApiRoute() {
    setIsCallingApi(true)
    setApiError(null)

    try {
      const response = await fetch(
        `/api/test-ui?message=${encodeURIComponent(apiMessage)}`
      )
      const body = (await response.json()) as DemoResult | { error: string }

      if (!response.ok || "error" in body) {
        setApiResult(null)
        setApiError("error" in body ? body.error : "API request failed")
        return
      }

      setApiResult(body)
    } catch {
      setApiResult(null)
      setApiError("Could not reach API route")
    } finally {
      setIsCallingApi(false)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <Badge variant="secondary">use server</Badge>
          <CardTitle className="flex items-center gap-2">
            <IconServer className="size-5" /> Server Action
          </CardTitle>
          <CardDescription>
            UI mutation. Validate input server-side. Add auth and resource permission
            checks before real writes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server-message">Message</Label>
            <Input
              id="server-message"
              maxLength={80}
              onChange={(event) => setServerMessage(event.target.value)}
              value={serverMessage}
            />
          </div>
          <Button
            disabled={serverMessage.trim().length === 0}
            isLoading={isExecuting}
            onClick={() => executeAsync({ message: serverMessage })}
            type="button"
          >
            Run Server Action
          </Button>
          <Result result={result.data ?? null} />
          {result.serverError ? (
            <p className="text-sm text-destructive">{result.serverError}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <Badge variant="secondary">app/api/test-ui/route.ts</Badge>
          <CardTitle className="flex items-center gap-2">
            <IconApi className="size-5" /> API Route
          </CardTitle>
          <CardDescription>
            HTTP endpoint for webhooks, third parties, mobile, or public APIs. Not
            default choice for internal UI mutation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-message">Query message</Label>
            <Input
              id="api-message"
              maxLength={80}
              onChange={(event) => setApiMessage(event.target.value)}
              value={apiMessage}
            />
          </div>
          <Button
            disabled={apiMessage.trim().length === 0}
            isLoading={isCallingApi}
            onClick={callApiRoute}
            type="button"
            variant="outline"
          >
            Call /api/test-ui
          </Button>
          <Result result={apiResult} />
          {apiError ? <p className="text-sm text-destructive">{apiError}</p> : null}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <Badge variant="secondary">use client + Jotai</Badge>
          <CardTitle className="flex items-center gap-2">
            <IconBrandReact className="size-5" /> Browser Interaction and UI State
          </CardTitle>
          <CardDescription>
            This component has event handlers and browser `fetch`, so it is client
            code. Jotai atom shares temporary UI state across client components.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              aria-label="Decrease Jotai count"
              onClick={() => setCount((value) => value - 1)}
              size="icon"
              type="button"
              variant="outline"
            >
              <IconArrowDown className="size-4" />
            </Button>
            <output className="min-w-24 text-center text-3xl font-semibold">{count}</output>
            <Button
              aria-label="Increase Jotai count"
              onClick={() => setCount((value) => value + 1)}
              size="icon"
              type="button"
            >
              <IconArrowUp className="size-4" />
            </Button>
            <Button onClick={() => setCount(0)} type="button" variant="ghost">
              Reset
            </Button>
          </div>
          <Separator />
          <p className="text-sm text-muted-foreground">
            Keep server data in Prisma, Server Components, Server Actions, or a
            request cache. Use Jotai for shared client UI state like dialogs,
            filters, and temporary workflow state.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
