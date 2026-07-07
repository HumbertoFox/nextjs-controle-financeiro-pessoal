import { getUser } from '@/_lib/dal';
import SettingsPageClient from './settings-client';
import { Metadata } from 'next';
import { LoadingSettings } from '@/_components/loadings/loading-settings';
import { Suspense } from 'react';
import { userRepository } from '@/_lib/userrepositorys';
import { UserPublic } from '@/_types';
import { redirect } from 'next/navigation';

export const generateMetadata = async (): Promise<Metadata> => {
    return { title: 'Configurações' };
}

export default async function SettingsPage() {
    const userActive = await getUser() as UserPublic;
    if (!userActive) redirect('/logout');
    const user = await userRepository.findActiveById(userActive.id);
    const familyMembers = user.family_id ? await userRepository.findByFamilyId(user.family_id) : [];
    return (
        <Suspense fallback={<LoadingSettings />}>
            <SettingsPageClient
                user={user}
                familyMembers={familyMembers}
            />
        </Suspense>
    );
}