import { ROUTES } from "@/constants"
import {
  IconLayoutGrid,
  IconUsers,
  IconChartLine,
  IconCalendar,
  IconMoneybag,
  IconFile,
  IconFileReport,
  IconTestPipe,
} from "@tabler/icons-react"
import type { NavMainGroup } from "./NavMain"

export const sidebarNavGroups: NavMainGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: ROUTES.HOME,
        icon: IconLayoutGrid,
      },
    ],
  },
  {
    label: "Directory",
    items: [
      {
        title: "Clients",
        url: ROUTES.CLIENTS,
        icon: IconUsers,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        title: "Investments",
        url: ROUTES.INVESTMENTS,
        icon: IconChartLine,
      },
      {
        title: "Payout schedules",
        url: ROUTES.PAYOUT_SCHEDULES,
        icon: IconCalendar,
      },
      {
        title: "Remittances",
        url: ROUTES.REMITTANCES,
        icon: IconMoneybag,
      },
      {
        title: "Contracts",
        url: ROUTES.CONTRACTS,
        icon: IconFile,
      },
    ],
  },
  {
    label: "Planning",
    items: [
      {
        title: "Calendar",
        url: ROUTES.CALENDAR,
        icon: IconCalendar,
      },
      {
        title: "Reports",
        url: ROUTES.REPORTS,
        icon: IconFileReport,
      },
    ],
  },
  // Show Test UI only in dev
  ...(process.env.NODE_ENV === "development"
    ? [
        {
          label: "Test UI",
          items: [
            {
              title: "Test UI",
              url: ROUTES.TEST_UI,
              icon: IconTestPipe,
            },
          ],
        },
      ]
    : []),
]
