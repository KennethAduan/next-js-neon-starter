"use client"

import { createContext, use } from "react"

type BreadcrumbLabelContextValue = {
  labels: Map<string, string>
  setLabel: (segment: string, label: string) => void
}

const BreadcrumbLabelContext = createContext<BreadcrumbLabelContextValue>({
  labels: new Map(),
  setLabel: () => {},
})

export function useBreadcrumbLabels() {
  return use(BreadcrumbLabelContext)
}
