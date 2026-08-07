import ReactQueryProvider from "./ReactQueryProvider"
import { Provider as JotaiProvider } from "jotai"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "./theme-provider"

const AppProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <JotaiProvider>
        <ReactQueryProvider>
          <NuqsAdapter>
            <TooltipProvider>{children}</TooltipProvider>
          </NuqsAdapter>
        </ReactQueryProvider>
      </JotaiProvider>
    </ThemeProvider>
  )
}

export default AppProviders
