import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

export function PatternHeader({
  badge,
  title,
  icon,
  description,
  useWhen,
  avoidWhen,
}: {
  badge: string
  title: string
  icon: ReactNode
  description: string
  useWhen: string[]
  avoidWhen: string[]
}) {
  return (
    <div className="mb-6 space-y-3">
      <Badge className="font-mono" variant="secondary">
        {badge}
      </Badge>
      <h1 className="flex items-center gap-2 font-heading text-2xl font-semibold tracking-tight">
        <span className="text-muted-foreground">{icon}</span> {title}
      </h1>
      <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>
      <div className="grid gap-4 rounded-xl bg-card p-4 ring-1 ring-foreground/10 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Use it for</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {useWhen.map((item) => (
              <li className="flex gap-2" key={item}>
                <span aria-hidden className="text-foreground/30">
                  +
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground">Not for</p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {avoidWhen.map((item) => (
              <li className="flex gap-2" key={item}>
                <span aria-hidden className="text-foreground/30">
                  -
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
