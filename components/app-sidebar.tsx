"use client"

import * as React from "react"
import {
  IconChartBar,
  IconHelp,
} from "@tabler/icons-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

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
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  
  const data = {
    user: {
      name: "CS47N: Datathletics",
      email: "Spring 2025",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Leaderboard",
        url: "/",
        icon: IconChartBar,
        isActive: pathname === "/",
      },
      {
        title: "About",
        url: "/about",
        icon: IconHelp,
        isActive: pathname === "/about",
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <span className="text-xl mr-1">⚾</span>
                <span className="text-base font-semibold">Baseball Predictions</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
