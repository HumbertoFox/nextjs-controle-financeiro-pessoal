import { getUser } from '@/_lib/dal';
import FamilyPageClient from './family-client';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoadingSettings } from '@/_components/loadings/loading-settings';
import { userRepository } from '@/_lib/userrepositorys';
import { UserPublic } from '@/_types';
import { redirect } from 'next/navigation';
import { getCsrfToken } from '@/_lib/csrf';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Família' };
}

export default async function FamilyPage() {
    const userActive = await getUser() as UserPublic;
    if (!userActive) redirect('/login');
    const [user, csrfToken] = await Promise.all([userRepository.findActiveById(userActive.id), getCsrfToken()]);
    const familyMembers = user.family_id
        ? await userRepository.findByFamilyId(user.family_id)
        : [];
    return (
        <Suspense fallback={<LoadingSettings />}>
            <FamilyPageClient
                user={user}
                csrfToken={csrfToken}
                familyMembers={familyMembers}
            />
        </Suspense>
    );
}