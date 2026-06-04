import { DashboardSidebarHeader } from '@/_components/dashboard-sidebar-header';
import RegisterUpdateUserForm from '@/_components/form-register-user';
import { LoadingRegister } from '@/_components/loadings/loading-register';
import { getCsrfToken } from '@/_lib/csrf';
import { userRepository } from '@/_lib/userrepositorys';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Atualizar usuário' };
}

const breadcrumbItems = [
    { text: 'Painel', href: '/dashboard' },
    { text: 'Administradores', href: '/dashboard/admins' },
    { text: 'Atualizar usuário' }
];

export default async function Update({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [user, csrfToken] = await Promise.all([userRepository.findActiveById(id), getCsrfToken()]);
    if (!user) redirect('/dashboard');
    return (
        <>
            <DashboardSidebarHeader items={breadcrumbItems} />
            <Suspense fallback={<LoadingRegister />}>
                <RegisterUpdateUserForm
                    user={user}
                    isEdit={true}
                    titleForm="Atualizar conta de usuário"
                    valueButton="Atualizar conta"
                    csrfToken={csrfToken}
                />
            </Suspense>
        </>
    );
}