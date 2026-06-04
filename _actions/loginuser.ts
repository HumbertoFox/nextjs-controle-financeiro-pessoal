'use server';

import { FormStateLoginUser, signInSchema } from '@/_lib/definitions';
import { compare } from 'bcrypt-ts';
import { createSession } from '@/_lib/session';
import z from 'zod';
import { userRepository } from '@/_lib/userrepositorys';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { headers } from 'next/headers';
import { checkLoginRateLimit, resetLoginRateLimit } from '@/_lib/ratelimit';

export async function loginUser(_: FormStateLoginUser, formData: FormData): Promise<FormStateLoginUser> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { warning: 'Invalid security token. Please refresh the page and try again.' };

    const validatedFields = signInSchema.safeParse({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email, password } = validatedFields.data;

    const requestHeaders = await headers();
    const forwarded = requestHeaders.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : (requestHeaders.get('x-real-ip') ?? 'unknown');

    const rateLimit = await checkLoginRateLimit(ip, email);

    if (!rateLimit.allowed) {
        const secs = rateLimit.retryAfterSeconds;
        const timeLabel = secs < 60 ? `${secs} second${secs !== 1 ? 's' : ''}` : `${Math.ceil(secs / 60)} minute${Math.ceil(secs / 60) !== 1 ? 's' : ''}`;

        return { warning: `Too many login attempts. Please try again in ${timeLabel}.`, retryAfterSeconds: secs };
    }

    try {
        const user = await userRepository.findByEmailActive(email);

        if (!user) return { warning: 'Invalid email or password' };

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            if (rateLimit.warning === 'will-be-blocked') {
                return { warning: 'Invalid email or password! Warning: one more failed attempt will block your account for 10 minutes.' };
            }
            return { warning: 'Invalid email or password' };
        }

        await resetLoginRateLimit(ip, email);

        // Incrementa session_version e obtém o novo valor
        const sessionVersion = await userRepository.incrementSessionVersion(user.id);

        await createSession(user.id, user.role, sessionVersion);

        await regenerateCsrfToken();

        return { message: 'Authentication successful! Redirecting to the Dashboard, please wait...' };
    } catch (error) {
        console.error('Unknown error occurred:', error);
        return { warning: 'Something went wrong. Please try again later.' };
    };
}