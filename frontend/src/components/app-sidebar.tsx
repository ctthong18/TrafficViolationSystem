"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    AlertCircle,
    BarChart3,
    Camera,
    Car,
    CreditCard,
    FileText,
    Gavel,
    LayoutDashboard,
    Settings,
    ShieldAlert,
    Users,
} from "lucide-react"

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

const data = {
    user: {
        name: "Officer Smith",
        email: "smith@traffic.gov",
        avatar: "/avatars/officer.png",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/",
            icon: LayoutDashboard,
        },
        {
            title: "Violations",
            url: "/violations",
            icon: ShieldAlert,
        },
        {
            title: "Vehicles",
            url: "#",
            icon: Car,
        },
        {
            title: "Cameras",
            url: "#",
            icon: Camera,
        },
        {
            title: "Fines & Payments",
            url: "#",
            icon: CreditCard,
        },
        {
            title: "Complaints",
            url: "#",
            icon: Gavel,
        },
        {
            title: "Reports",
            url: "#",
            icon: BarChart3,
        },
    ],
    secondary: [
        {
            title: "Users",
            url: "#",
            icon: Users,
        },
        {
            title: "Settings",
            url: "#",
            icon: Settings,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="#">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <ShieldAlert className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="font-semibold truncate">Traffic System</span>
                                    <span className="text-xs truncate">Safety & Enforcement</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    {data.navMain.map((item) => {
                        const pathname = usePathname()
                        const isActive = pathname === item.url
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
                                    <Link href={item.url}>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
                <SidebarMenu className="mt-auto">
                    {data.secondary.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton tooltip={item.title}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                                <Users className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="font-semibold truncate">{data.user.name}</span>
                                <span className="text-xs truncate">{data.user.email}</span>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
