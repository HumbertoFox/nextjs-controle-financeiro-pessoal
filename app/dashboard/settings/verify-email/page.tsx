import { getUser } from '@/_lib/dal';
import { redirect } from 'next/navigation';
import VerifyEmailClient from './verify-email-client';
import { getCsrfToken } from '@/_lib/csrf';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingSettingsVerifyEmail } from '@/_components/loadings/loading-settings-verify-email';
import { UserPublic } from '@/_types';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Verificar e-mail do usuário' };
}

export default async function VerifyEmailSettingsPage() {
    const user = await getUser() as UserPublic;
    if (!user) redirect('/login');
    if (user.email_verified) redirect('/dashboard/settings/profile');
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingSettingsVerifyEmail />}>
            <VerifyEmailClient csrfToken={csrfToken} />
        </Suspense>
    );
}