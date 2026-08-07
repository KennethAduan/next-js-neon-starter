"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "nextjs-toploader/app"
import { cn } from "@/lib/utils"
import { IconArrowLeft } from "@tabler/icons-react"

type BackButtonProps = {
  className?: string
  variant?: "outline" | "ghost" | "default" | "secondary" | "link"
  path?: string
}
const BackButton = ({ className, variant = "link", path }: BackButtonProps) => {
  const router = useRouter()

  const navigateBack = () => {
    if (path) {
      router.push(path)
    } else {
      router.back()
    }
  }

  return (
    <Button
      variant={variant}
      onClick={navigateBack}
      className={cn("flex w-fit cursor-pointer items-center gap-2", className)}
    >
      <IconArrowLeft className="size-4" />
      Back
    </Button>
  )
}

export default BackButton
