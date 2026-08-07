import { ReactNode, Suspense } from "react"

const AuthLayout = ({ children }: { children: ReactNode }): ReactNode => {
  return (
    <Suspense>
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </Suspense>
  )
}

export default AuthLayout
