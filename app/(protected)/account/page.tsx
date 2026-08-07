import React from "react"
import AccountPage from "@/features/account/AccountPage"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account",
  description: "Account",
}

const page = () => {
  return <AccountPage />
}

export default page
