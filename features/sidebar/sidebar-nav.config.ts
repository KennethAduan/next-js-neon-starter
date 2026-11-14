import { ROUTES } from "@/constants"
import { IconChecklist } from "@tabler/icons-react"
import type { NavMainGroup } from "./NavMain"

export const sidebarNavGroups: NavMainGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Todos",
        url: ROUTES.HOME,
        icon: IconChecklist,
      },
    ],
  },
]
