import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { getUser } from '@/_lib/dal';
import { UserDetailsProps, UserRolesZod } from '@/_types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'User' };
}

const breadcrumbItems = [
    { text: 'Dashboard', href: '/dashboard' },
    { text: 'User' }
];
const borderColors = ['border-emerald-500', 'border-violet-500', 'border-rose-500'];

export default async function UserPage() {
    const user = await getUser() as UserDetailsProps;
    if (!user || !UserRolesZod.includes(user.role)) redirect('/dashboard');
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col gap-4 p-2">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={index}
                            className={`bg-muted/50 aspect-video rounded-xl border ${borderColors[index % borderColors.length]}`}
                        />
                    ))}
                </div>
                <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min border border-sky-500" />
            </div>
        </>
    );
}