'use client';

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, useSidebar, } from '@/_components/ui/sidebar';
import AppLogoSvg from '@/_components/app-logo-svg';
import Link from 'next/link';
import { NavMainAdmins } from '@/_components/nav-main-admins';
import { LayoutGrid, UserRound, UserRoundCog, UserRoundPlus, UsersRound } from 'lucide-react';
import { NavMainUsers } from '@/_components/nav-main-users';
import { NavUser } from '@/_components/nav-user';
import { NavMainItemProps, ProfileForm, UserRole } from '@/_types';
import { NavMainUsersDashboard } from '@/_components/nav-main-users-dashboard';

type DashboardSidebarProps = React.ComponentProps<typeof Sidebar> & {
    user: ProfileForm;
    userType: UserRole;
}

const adminNavItems: NavMainItemProps[] = [
    { title: 'Administradores', href: '/dashboard/admins', icon: UserRoundCog },
    { title: 'Usuários', href: '/dashboard/admins/users', icon: UsersRound },
    { title: 'Registrar Usuário', href: '/dashboard/admins/register', icon: UserRoundPlus }
];
const userNavItems: NavMainItemProps[] = [
    { title: 'Usuário', href: '/dashboard/user', icon: UserRound }
];
const usersDashboardNavItems: NavMainItemProps[] = [
    { title: 'Painel', href: '/dashboard', icon: LayoutGrid }
];

export default function DashboardSidebar({ user, userType, ...props }: DashboardSidebarProps) {
    const { isMobile, setOpenMobile } = useSidebar();

    const handleLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        };
    };
    return (
        <Sidebar
            collapsible="icon"
            variant="floating"
            {...props}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href="/dashboard"
                                onClick={handleLinkClick}
                                prefetch
                            >
                                <AppLogoSvg />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            {userType === 'ADMIN' && (
                <SidebarContent
                    key="admin"
                    className="flex-none"
                >
                    <NavMainAdmins items={adminNavItems} />
                </SidebarContent>
            )}
            {userType && (
                <SidebarContent
                    key="user"
                    className="flex-none"
                >
                    <NavMainUsers items={userNavItems} />
                </SidebarContent>
            )}
            <SidebarContent key="dashboard">
                <NavMainUsersDashboard items={usersDashboardNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}