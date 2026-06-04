'use server';

import { CSRF_COOKIE_NAME } from '@/_types';
import crypto, { randomUUID } from 'crypto';
import { cookies } from 'next/headers';

export async function validateCsrfToken(submittedToken: string | null): Promise<boolean> {
    if (!submittedToken) return false;

    const storedToken = (await cookies()).get(CSRF_COOKIE_NAME)?.value;

    if (!storedToken) return false;

    try {
        return crypto.timingSafeEqual(Buffer.from(submittedToken), Buffer.from(storedToken));
    } catch {
        return false;
    }
}

export async function clearCsrfToken(): Promise<void> {
    (await cookies()).delete(CSRF_COOKIE_NAME);
}

export async function regenerateCsrfToken(): Promise<string> {
    const newToken = randomUUID();

    (await cookies()).set(CSRF_COOKIE_NAME, newToken, {
        httpOnly: false,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24
    });

    return newToken;
}

export async function getCsrfToken(): Promise<string | undefined> {
    return (await cookies()).get(CSRF_COOKIE_NAME)?.value;
}