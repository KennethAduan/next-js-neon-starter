import { Suspense } from "react"
import { TestUiNav } from "./_components/test-ui-nav"

export default function TestUiLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-3">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              Template Playground
            </h1>
            <p className="text-sm text-muted-foreground">
              Runnable examples for junior developer KT. Each page pairs a live demo with the
              real, current source code.
            </p>
          </div>
          <TestUiNav />
        </div>
        {children}
      </div>
    </Suspense>
  )
}
