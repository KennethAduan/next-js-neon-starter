import type { Metadata } from "next"
import Link from "next/link"
import { IconLock } from "@tabler/icons-react"

import { Card, CardContent } from "@/components/ui/card"
import { ROUTES } from "@/constants/app.routes"
import { getServerSession } from "@/features/auth/server/session.server"
import { PatternHeader } from "../_components/pattern-header"
import { CodeBlock } from "../_components/code-block"
import { AuthDemo } from "../_components/auth-demo"
import { readSourceFile } from "../_lib/read-source.server"

export const metadata: Metadata = {
  title: "Authentication | Template Playground",
}

const SAFE_ACTION_SOURCE_PATH = "lib/safe.action.ts"
const WHOAMI_SOURCE_PATH = "app/(hidden)/test-ui/_actions/whoami.action.ts"

export default async function AuthPatternPage() {
  const [session, safeActionSource, whoamiSource] = await Promise.all([
    getServerSession(),
    readSourceFile(SAFE_ACTION_SOURCE_PATH),
    readSourceFile(WHOAMI_SOURCE_PATH),
  ])

  return (
    <div>
      <PatternHeader
        avoidWhen={["Hiding a button as the only access control"]}
        badge="Better Auth"
        description="getServerSession() reads the session on the server. authActionClient wraps a Server Action so its middleware rejects the call before the action body runs if there is no session. Never accept a user id from browser input as authorization proof."
        icon={<IconLock className="size-5" />}
        title="Authentication"
        useWhen={[
          "Any Server Action or route that reads or writes a specific user's data",
          "Checking ownership, organization, or role before a mutation",
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-3 pt-6">
            <p className="text-sm text-muted-foreground">
              This card was rendered on the server with a live{" "}
              <code>getServerSession()</code> call.
            </p>
            {session ? (
              <div className="space-y-1">
                <p className="text-sm font-medium">Signed in</p>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium">Not signed in</p>
                <p className="text-sm text-muted-foreground">
                  Sign in to see the protected action below succeed instead of reject.
                </p>
                <Link className="text-sm font-medium hover:underline" href={ROUTES.LOGIN}>
                  Go to sign in
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Run both. The public action always succeeds. The protected one only succeeds
            when you are signed in above.
          </p>
          <AuthDemo />
        </div>
      </div>
      <div className="mt-6 space-y-4">
        <CodeBlock code={whoamiSource} filePath={WHOAMI_SOURCE_PATH} />
        <CodeBlock code={safeActionSource} filePath={SAFE_ACTION_SOURCE_PATH} />
      </div>
    </div>
  )
}
