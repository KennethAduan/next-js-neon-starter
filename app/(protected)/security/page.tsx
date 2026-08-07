import React from "react"
import SecurityPage from "@/features/security/SecurityPage"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Security",
  description: "Security",
}

const page = () => {
  return <SecurityPage />
}

export default page
