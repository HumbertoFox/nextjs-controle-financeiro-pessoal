import { Metadata } from 'next';
import PasswordPageClient from './password-client';
import LoadingPassword from '@/_components/loadings/loading-password';
import { Suspense } from 'react';
import { getCsrfToken } from '@/_lib/csrf';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Atualizar senha do usuário' };
}

export default async function PasswordPage() {
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingPassword />}>
            <PasswordPageClient
                csrfToken={csrfToken}
            />
        </Suspense>
    );
}