import DashboardSidebar from '@/_components/dashboard-sidebar';
import { SidebarInset, SidebarProvider, } from '@/_components/ui/sidebar';
import { getUser } from '@/_lib/dal';
import { ProfileForm, UserDetailsProps, UserRole } from '@/_types';

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    const user = await getUser() as UserDetailsProps;
    const role = user.role as UserRole;
    return (
        <SidebarProvider>
            <DashboardSidebar
                user={user as ProfileForm}
                userType={role}
            />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}