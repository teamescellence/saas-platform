"use client"

import * as React from "react"
import { type LucideIcon } from "lucide-react"
import { NavMain } from "@repo/ui/components/nav-main"
import { NavProjects } from "@repo/ui/components/nav-projects"
import { NavUser } from "@repo/ui/components/nav-user"
import { TeamSwitcher } from "@repo/ui/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/ui/sidebar"

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar?: string
  }
  teams?: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
  navMain: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
    }[]
  }[]
  projects?: {
    name: string
    url: string
    icon: LucideIcon
  }[]
  title?: string
  subtitle?: string
}

export function AppSidebar({
  user,
  teams,
  navMain,
  projects,
  title,
  subtitle,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {teams && teams.length > 0 ? (
          <TeamSwitcher teams={teams} />
        ) : (
          <div className="flex items-center gap-2.5 p-2 px-3">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">R</span>
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="text-sm font-bold tracking-tight text-foreground">{title || "ReviewFlow"}</span>
              {subtitle && (
                <span className="text-[10px] font-semibold text-primary uppercase tracking-widest leading-none">
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {projects && projects.length > 0 && <NavProjects projects={projects} />}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
