import { Geist_Mono, Noto_Sans } from "next/font/google"

import "./globals.css"
import { cn } from "@/lib/utils"
import { Toaster as SileoToaster } from "sileo"
import AppProviders from "@/providers/AppProviders"
import NextTopLoader from "nextjs-toploader"
import { Metadata } from "next"
const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "FXP PDF Generator",
  description: "FXP PDF Generator",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        notoSans.variable
      )}
    >
      <body>
        <NextTopLoader color="#D10000" height={3} showSpinner={false} />

        <AppProviders>{children}</AppProviders>
        <SileoToaster
          position="top-center"
          options={{
            fill: "var(--sileo-toast-bg)",
            roundness: 12,
            styles: {
              title: "text-(--sileo-toast-fg)!",
              description: "text-(--sileo-toast-fg)/80! text-center!",
            },
          }}
        />
      </body>
    </html>
  )
}
