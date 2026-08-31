import { Link, usePage } from "@inertiajs/react";
import {
    BookOpen,
    Calendar,
    FolderGit2,
    LayoutGrid,
    ScanLine,
    Ticket,
    Users,
} from "lucide-react";
import AppLogo from "@/components/app-logo";
import { NavFooter } from "@/components/nav-footer";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { dashboard } from "@/routes";
import type { NavItem } from "@/types";

const mainNavItems: NavItem[] = [
    {
        title: "Dashboard",
        href: dashboard(),
        icon: LayoutGrid,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: "Repository",
        href: "https://github.com/laravel/react-starter-kit",
        icon: FolderGit2,
    },
    {
        title: "Documentation",
        href: "https://laravel.com/docs/starter-kits#react",
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user?.role === "admin";

    const mainNavItems: NavItem[] = [
        {
            title: "Dashboard",
            href: dashboard(),
            icon: LayoutGrid,
        },
        ...(isAdmin
            ? [
                  {
                      title: "Users",
                      href: "/admin/users",
                      icon: Users,
                  },
                  {
                      title: "Events",
                      href: "/admin/events",
                      icon: Calendar,
                  },
                  {
                      title: "Scanner",
                      href: "/admin/scanner",
                      icon: ScanLine,
                  },
              ]
            : [
                //   {
                //       title: "My Tickets",
                //       href: "/admin/tickets",
                //       icon: Ticket,
                //   },
                  {
                      title: "Land Calculator",
                      href: "/land-calculator",
                      icon: Ticket,
                  },
              ]),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
