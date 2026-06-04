import 'server-only';
import { cache } from 'react';
import { verifySession } from '@/_lib/session';
import { userRepository } from '@/_lib/userrepositorys';
import { UserPublic } from '@/_types';

export const getUser = cache(async () => {
    const session = await verifySession();
    if (!session) return null;

    try {
        const user = await userRepository.findPublicById(session.userId);

        if (!user) return null;

        return user as UserPublic;
    } catch (error) {
        console.log('Failed to fetch user', error);
        return null;
    };
})