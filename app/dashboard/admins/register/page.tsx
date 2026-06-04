import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import { Metadata } from 'next';
import RegisterUser from '@/_components/form-register-user';
import { Suspense } from 'react';
import { LoadingRegister } from '@/_components/loadings/loading-register';
import { getCsrfToken } from '@/_lib/csrf';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Register User' };
}

const breadcrumbItems = [
    { text: 'Dashboard', href: '/dashboard' },
    { text: 'Admins', href: '/dashboard/admins' },
    { text: 'Register' }
];

export default async function RegisterUsersPage() {
    const csrfToken = await getCsrfToken();
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <Suspense fallback={<LoadingRegister />}>
                <RegisterUser
                    titleForm="Register User Acount"
                    valueButton="Register"
                    csrfToken={csrfToken}
                />
            </Suspense>
        </>
    );
}