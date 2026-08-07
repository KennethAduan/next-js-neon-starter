"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { ROUTES } from "@/constants/app.routes"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbLabels } from "./BreadcrumbLabelContext"

const ROUTE_LABEL_MAP: Record<string, string> = {
  [ROUTES.HOME]: "Home",
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const formatSegmentLabel = (segment: string) =>
  segment
    .split("-")
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ")

const BreadcrumbSidebar = () => {
  const pathname = usePathname()
  const { labels } = useBreadcrumbLabels()
  const pathSegments = pathname.split("/").filter(Boolean)

  if (pathSegments.length === 0) {
    return null
  }

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`
    const isLast = index === pathSegments.length - 1

    const label =
      ROUTE_LABEL_MAP[href] ??
      labels.get(segment) ??
      (UUID_RE.test(segment) ? "…" : formatSegmentLabel(segment))

    return { href, isLast, label }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbItems.map((item) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {!item.isLast ? <BreadcrumbSeparator /> : null}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BreadcrumbSidebar
