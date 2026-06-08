import { redirect } from 'next/navigation';
import { getCsrfToken } from '@/_lib/csrf';
import InviteAcceptClient from './invite-accept-client';
import { InviteAcceptPageProps } from '@/_types';
import { Suspense } from 'react';
import LoadingInviteAccept from '@/_components/loadings/loading-invite-accept';
import { Metadata } from 'next';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Aceitar convite' };
}

export default async function InviteAcceptPage({ searchParams }: InviteAcceptPageProps) {
    const { email, token } = await searchParams;
    if (!email || !token) redirect('/login');
    const csrfToken = await getCsrfToken();
    return (
        <Suspense fallback={<LoadingInviteAccept />}>
            <InviteAcceptClient
                email={email}
                token={token}
                csrfToken={csrfToken}
            />
        </Suspense>
    );
}