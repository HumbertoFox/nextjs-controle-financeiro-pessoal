import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { getUser } from '@/_lib/dal';
import { userRepository } from '@/_lib/userrepositorys';
import { UserPublic, UserRolesZod } from '@/_types';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { UserSummaryCards } from './user-summary-cards';
import { UserDetailsTable } from './user-details-table';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Usuário' };
}

const breadcrumbItems = [
    { text: 'Painel', href: '/dashboard' },
    { text: 'Usuário' }
];

export default async function UserPage() {
    const userActive = await getUser() as UserPublic;
    if (!userActive || !UserRolesZod.includes(userActive.role)) redirect('/logout');
    const [user, { accounts }] = await Promise.all([
        userRepository.findActiveById(userActive.id),
        userRepository.getUserPageData(userActive.id)
    ]);
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <div className="flex flex-1 flex-col gap-4 p-2">
                <UserSummaryCards
                    user={user}
                    accounts={accounts}
                />
                <UserDetailsTable
                    user={user}
                    familyName={user.family_name ?? null}
                />
            </div>
        </>
    );
}