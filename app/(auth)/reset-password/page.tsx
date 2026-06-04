import { Suspense } from 'react';
import ResetPasswordClient from './reset-password-client';
import LoadingResetPassword from '@/_components/loadings/loading-reset-password';
import { Metadata } from 'next';
import { getCsrfToken } from '@/_lib/csrf';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Reset Password' };
}

export default async function ResetPasswordPage() {
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingResetPassword />}>
            <ResetPasswordClient
                csrfToken={csrfToken}
            />
        </Suspense>
    );
}