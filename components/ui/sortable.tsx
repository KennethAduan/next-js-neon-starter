"use client"

import * as React from "react"

interface SortableProps<TValue> {
  value: Array<TValue>
  onValueChange?: (value: Array<TValue>) => void
  getItemValue?: (item: TValue) => string
  children: React.ReactNode
}

function Sortable<TValue>({ children }: SortableProps<TValue>) {
  return <>{children}</>
}

interface RenderableProps {
  render?: React.ReactElement
  children?: React.ReactNode
  nativeButton?: boolean
}

function renderContent({ render, children }: RenderableProps) {
  if (render) {
    return React.cloneElement(render, undefined, children)
  }

  return <>{children}</>
}

function SortableContent({ render, children }: RenderableProps) {
  return renderContent({ render, children })
}

interface SortableItemProps extends RenderableProps {
  value: string
  nativeButton?: boolean
}

function SortableItem({ render, children }: SortableItemProps) {
  return renderContent({ render, children })
}

function SortableItemHandle({ render, children }: RenderableProps) {
  return renderContent({ render, children })
}

// Placeholder until drag-and-drop Sortable is wired; must not render overlay
// chrome (Filter/Sort lists would leak placeholders into the toolbar).
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- accepts children from call sites
function SortableOverlay(_props: { children?: React.ReactNode }) {
  return null
}

export {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
  SortableOverlay,
}
