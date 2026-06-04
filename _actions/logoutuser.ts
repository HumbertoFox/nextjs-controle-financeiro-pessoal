'use server';

import { clearCsrfToken } from '@/_lib/csrf';
import { cookies } from 'next/headers';

export async function deleteSession() {
    const session = (await cookies()).get('sessionAuth');

    if (session) {
        (await cookies()).delete('sessionAuth');
        await clearCsrfToken();
        return true;
    };
    return false;
}