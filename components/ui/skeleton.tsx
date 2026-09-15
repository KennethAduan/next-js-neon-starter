import { cn } from "@/lib/utils"

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: "default" | "dashed"
}) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant}
      className={cn(
        "animate-pulse bg-muted",
        variant === "default" && "rounded-md",
        variant === "dashed" && "rounded-md border border-dashed",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
