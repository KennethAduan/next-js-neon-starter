import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  variant = "default",
  completed = false,
  ...props
}: React.ComponentProps<"input"> & {
  variant?: "default" | "md" | "join" | "affix" | "plain"
  /** Soft strikethrough treatment for completed todo titles (plain variant). */
  completed?: boolean
}) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-variant={variant}
      data-completed={completed ? "true" : undefined}
      className={cn(
        "h-8 w-full min-w-0 border border-input bg-transparent py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        variant === "default" && "rounded-lg px-2.5",
        variant === "md" && "rounded-md px-2.5",
        variant === "join" && "rounded-none px-1.5",
        variant === "affix" && "rounded-lg pr-8 pl-2.5",
        variant === "plain" &&
          "rounded-none border-transparent px-0 shadow-none focus-visible:border-border focus-visible:bg-background dark:bg-transparent dark:focus-visible:bg-background",
        variant === "plain" &&
          completed &&
          "text-muted-foreground line-through",
        className
      )}
      {...props}
    />
  )
}

export { Input }
