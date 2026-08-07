import type { NavMainGroup, NavMainItem } from "./NavMain"
import { isRouteActive } from "./is-route-active"

export type NavMainItemWithActive = NavMainItem & {
  isActive: boolean
  items?: Array<NonNullable<NavMainItem["items"]>[number] & { isActive: boolean }>
}

export type NavMainGroupWithActive = Omit<NavMainGroup, "items"> & {
  items: NavMainItemWithActive[]
}

export function withActiveGroups(
  groups: NavMainGroup[],
  pathname: string
): NavMainGroupWithActive[] {
  return groups.map(
    (group): NavMainGroupWithActive => ({
      label: group.label,
      items: group.items.map(
        (item): NavMainItemWithActive => ({
          ...item,
          isActive: item.isActive ?? isRouteActive(pathname, item.url),
          items: item.items?.map((subItem) => ({
            ...subItem,
            isActive: subItem.isActive ?? isRouteActive(pathname, subItem.url),
          })),
        })
      ),
    })
  )
}

function getItemOpenState(
  item: NavMainItemWithActive,
  openByUrl: Record<string, boolean>
): boolean {
  const hasActiveChild = item.items!.some((subItem) => subItem.isActive)
  if (item.isActive || hasActiveChild) {
    return true
  }

  return openByUrl[item.url] ?? false
}

export function resolveOpenByUrl(
  groupsWithActive: NavMainGroupWithActive[],
  openByUrl: Record<string, boolean>
): Record<string, boolean> {
  const collapsibleItems = groupsWithActive.flatMap((group) =>
    group.items.filter((item) => Boolean(item.items?.length))
  )

  return Object.fromEntries(
    collapsibleItems.map((item) => [item.url, getItemOpenState(item, openByUrl)])
  )
}
