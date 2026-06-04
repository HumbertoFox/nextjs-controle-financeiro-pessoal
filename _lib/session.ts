import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserRole } from '@/_types';
import { userRepository } from './userrepositorys';

if (!process.env.AUTH_SECRET) throw new Error('SECRET is not defined');

const secretKey = process.env.AUTH_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);
const MAX_SESSION_AGE = 24 * 60 * 60;
const TOKEN_LIFETIME = 15 * 60;
const RENEW_THRESHOLD = 5 * 60;

export async function decrypt(session: string | undefined = '') {
    if (!session) return null;
    try {
        const { payload } = await jwtVerify(
            session,
            encodedKey,
            { algorithms: ['HS256'] }
        );
        return payload;
    } catch (err) {
        console.log('failed to verify session', err);
        return null;
    };
}

export async function createSession(userId: string, role: UserRole, sessionVersion: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const expTimestamp = now + TOKEN_LIFETIME;
    const expDate = new Date(expTimestamp * 1000);

    const session = await new SignJWT({
        userId, role, sessionVersion, iat: now
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt(now)
        .setExpirationTime(expTimestamp)
        .sign(encodedKey);

    (await cookies()).set('sessionAuth', session, {
        httpOnly: true,
        secure: true,
        expires: expDate,
        sameSite: 'lax',
        path: '/'
    });
}

export async function verifySession(): Promise<{ isAuth: boolean; userId: string; }> {
    const cookie = (await cookies()).get('sessionAuth')?.value;
    const session = await decrypt(cookie);

    if (!session?.userId) redirect('/login');

    const user = await userRepository.findSessionVersion(String(session.userId));

    if (!user || user.session_version !== session.sessionVersion) {
        redirect('/login');
    }

    return { isAuth: true, userId: String(session.userId) };
}

export async function getSession() {
    const session = (await cookies()).get('sessionAuth')?.value;
    if (!session) return null;

    return await decrypt(session);
}

export async function updateSession() {
    const sessionToken = (await cookies()).get('sessionAuth')?.value;

    if (!sessionToken) return null;

    const payload = await decrypt(sessionToken);

    if (!payload?.userId || !payload.exp || !payload.iat) return null;

    const now = Math.floor(Date.now() / 1000);
    const timeLeft = payload.exp - now;
    const sessionAge = now - payload.iat;

    if (sessionAge > MAX_SESSION_AGE) {
        (await cookies()).delete('sessionAuth');
        return null;
    };

    if (timeLeft < RENEW_THRESHOLD) {
        const newExp = now + TOKEN_LIFETIME;
        const newExpDate = new Date(newExp * 1000);

        const newToken = await new SignJWT({
            userId: payload.userId,
            role: payload.role,
            sessionVersion: payload.sessionVersion,
            iat: payload.iat
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt(payload.iat)
            .setExpirationTime(newExp)
            .sign(encodedKey);

        (await cookies()).set('sessionAuth', newToken, {
            httpOnly: true,
            secure: true,
            expires: newExpDate,
            sameSite: 'lax',
            path: '/'
        });
    };
    return {
        userId: payload.userId,
        role: payload.role as UserRole
    };
}