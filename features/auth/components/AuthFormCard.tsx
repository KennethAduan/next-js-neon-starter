import type { ReactNode } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field } from "@/components/ui/field"

interface AuthFormCardProps {
  title: string
  description: string
  onSubmit: () => void
  headerClassName?: string
  beforeHeader?: ReactNode
  children: ReactNode
}

function AuthFormCard({
  title,
  description,
  onSubmit,
  headerClassName,
  beforeHeader,
  children,
}: AuthFormCardProps) {
  const header = (
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  )

  return (
    <Card>
      {beforeHeader}
      {headerClassName ? <div className={headerClassName}>{header}</div> : header}
      <CardContent>
        <form action={onSubmit}>
          <Field>{children}</Field>
        </form>
      </CardContent>
    </Card>
  )
}

export { AuthFormCard }
