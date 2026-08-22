"use client"

import { useAction } from "next-safe-action/hooks"
import { Button } from "@/components/ui/button"
import { publicPingAction, whoAmIAction } from "../_actions/whoami.action"

function ActionResultCard({
  label,
  badge,
  onRun,
  isExecuting,
  data,
  error,
}: {
  label: string
  badge: string
  onRun: () => void
  isExecuting: boolean
  data: unknown
  error: string | null | undefined
}) {
  return (
    <div className="space-y-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{label}</p>
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          {badge}
        </code>
      </div>
      <Button isLoading={isExecuting} onClick={onRun} size="sm" type="button" variant="outline">
        Run
      </Button>
      {data ? (
        <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : (
        <p className="text-sm text-muted-foreground">Run to see response.</p>
      )}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}

export function AuthDemo() {
  const publicAction = useAction(publicPingAction)
  const protectedAction = useAction(whoAmIAction)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ActionResultCard
        badge="actionClient"
        data={publicAction.result.data}
        error={publicAction.result.serverError}
        isExecuting={publicAction.isExecuting}
        label="Public action"
        onRun={() => publicAction.executeAsync()}
      />
      <ActionResultCard
        badge="authActionClient"
        data={protectedAction.result.data}
        error={protectedAction.result.serverError}
        isExecuting={protectedAction.isExecuting}
        label="Protected action"
        onRun={() => protectedAction.executeAsync()}
      />
    </div>
  )
}
