"use client"

import { useAtom } from "jotai"
import { IconArrowDown, IconArrowUp } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { stackPlaygroundCountAtom } from "../_atoms/stack-playground.atom"

export function ClientStateDemo() {
  const [count, setCount] = useAtom(stackPlaygroundCountAtom)

  return (
    <div className="space-y-4">
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
        Keep server data in Prisma, Server Components, Server Actions, or a request cache.
        Use Jotai for shared client UI state like dialogs, filters, and temporary workflow
        state.
      </p>
    </div>
  )
}
