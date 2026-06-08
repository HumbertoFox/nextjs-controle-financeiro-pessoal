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
    if (!isValidCsrf) return { warning: 'Token de segurança inválido. Atualize a página e tente novamente.' };

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

        return { warning: `Muitas tentativas de login. Tente novamente em ${timeLabel}.`, retryAfterSeconds: secs };
    }

    try {
        const user = await userRepository.findByEmailActive(email);

        if (!user) return { warning: 'E-mail ou senha inválidos' };

        const isPasswordValid = await compare(password, user.password);

        if (!isPasswordValid) {
            if (rateLimit.warning === 'will-be-blocked') {
                return { warning: 'E-mail ou senha inválidos! Aviso: mais uma tentativa incorreta bloqueará sua conta por 10 minutos.' };
            }
            return { warning: 'E-mail ou senha inválidos' };
        }

        await resetLoginRateLimit(ip, email);

        // Incrementa session_version e obtém o novo valor
        const sessionVersion = await userRepository.incrementSessionVersion(user.id);

        await createSession(user.id, user.role, sessionVersion);

        await regenerateCsrfToken();

        return { message: 'Autenticação realizada com sucesso! Redirecionando para o Painel de Controle, aguarde...' };
    } catch (error) {
        console.error('Unknown error occurred:', error);
        return { warning: 'Algo deu errado. Por favor, tente novamente mais tarde.' };
    };
}