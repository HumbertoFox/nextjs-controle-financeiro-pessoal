import { Suspense } from 'react';
import VerifyEmailClient from './verify-email-client';
import LoadingVerifyEmail from '@/_components/loadings/loading-verify-email';
import { Metadata } from 'next';
import { getCsrfToken } from '@/_lib/csrf';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Verificar e-mail' };
}

export default async function VerifyEmailPage() {
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingVerifyEmail />}>
            <VerifyEmailClient
                csrfToken={csrfToken}
            />
        </Suspense>
    );
}