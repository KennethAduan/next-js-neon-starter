import { redirect } from "next/navigation"
import { ROUTES } from "@/constants/app.routes"

export default function HomePage() {
  redirect(ROUTES.DOCS)
}
