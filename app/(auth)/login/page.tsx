import { Suspense } from 'react';
import { Metadata } from 'next';
import { LoginClient } from './login-client';
import { LoadingLogin } from '@/_components/loadings/loading-login';
import { getCsrfToken } from '@/_lib/csrf';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Log in' };
}

export default async function LoginPage() {
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingLogin />}>
            <LoginClient
                csrfToken={csrfToken}
            />
        </Suspense>
    );
}