import { z } from "zod"

const ApiMessageSchema = z.object({
  message: z.string().trim().min(1).max(80),
})

/** Public, read-only teaching endpoint. Real APIs require auth when data is private. */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const result = ApiMessageSchema.safeParse({
    message: searchParams.get("message") ?? "Hello from API route",
  })

  if (!result.success) {
    return Response.json({ error: "Message must contain 1 to 80 characters." }, { status: 400 })
  }

  return Response.json({
    message: result.data.message,
    respondedAt: new Date().toISOString(),
    runtime: "Route Handler",
  })
}
