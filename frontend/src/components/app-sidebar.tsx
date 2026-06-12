import * as React from "react"
import {
  Building2,
  CalendarClock,
  LayoutDashboard,
  Trophy,
} from "lucide-react"
import { Link } from "react-router-dom"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { LoginUserResponse } from "@/features/auth/types"
import { routePaths } from "@/routes/routePaths"

const vendorNavigation = [
  {
    title: "Dashboard",
    url: routePaths.vendorDashboard,
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Venue management",
    url: routePaths.vendorVenues,
    icon: Building2,
    items: [
      {
        title: "Venues",
        url: routePaths.vendorVenues,
      },
      {
        title: "Courts",
        url: routePaths.vendorCourts,
      },
      {
        title: "Venue images",
        url: routePaths.vendorImages,
      },
    ],
  },
  {
    title: "Operations",
    url: routePaths.vendorSlots,
    icon: CalendarClock,
    items: [
      {
        title: "Court slots",
        url: routePaths.vendorSlots,
      },
      {
        title: "Create booking",
        url: routePaths.vendorBookingCreate,
      },
      {
        title: "Bookings",
        url: routePaths.vendorBookings,
      },
    ],
  },
]

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: LoginUserResponse
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to={routePaths.vendorDashboard}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Trophy className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Sport Booking</span>
                  <span className="truncate text-xs">Vendor portal</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={vendorNavigation} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={user}
          profileUrl={routePaths.vendorProfile}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
