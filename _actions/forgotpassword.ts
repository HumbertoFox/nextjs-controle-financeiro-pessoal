'use server';

import { sendPasswordResetEmail } from '@/_lib/mail';
import { FormStatePasswordForgot, passwordForgotSchema } from '@/_lib/definitions';
import crypto from 'crypto';
import { userRepository } from '@/_lib/userrepositorys';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import z from 'zod';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { hashToken } from '@/_lib/tokenutils';
import { checkForgotPasswordRateLimit } from '@/_lib/ratelimit';
import { getTransactionClient } from '@/_lib/db';

export async function forgotPassword(_: FormStatePasswordForgot, formData: FormData): Promise<FormStatePasswordForgot> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { error: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const validatedFields = passwordForgotSchema.safeParse({ email: formData.get('email') as string });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { email } = validatedFields.data;

    const rateLimit = await checkForgotPasswordRateLimit(email);
    if (!rateLimit.allowed) {
        const secs = rateLimit.retryAfterSeconds;
        const timeLabel = secs < 60 ? `${secs} second${secs !== 1 ? 's' : ''}` : `${Math.ceil(secs / 60)} minute${Math.ceil(secs / 60) !== 1 ? 's' : ''}`;
        return { error: `Muitas tentativas. Por favor, tente novamente em ${timeLabel}.` };
    }

    const genericMessage = {
        message: 'Se o seu e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
    };

    const client = await getTransactionClient();

    try {
        await client.query('BEGIN');

        const user = await userRepository.findByEmail(email, client);

        if (!user) {
            await client.query('ROLLBACK')
            return genericMessage;
        }

        const tokenExisting = await verificationTokenRepository.findByIdentifier(email, client);

        if (tokenExisting) {
            await client.query('ROLLBACK');
            return genericMessage;
        }

        const rawToken = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();

        await verificationTokenRepository.deleteByIdentifier(email, client);
        await verificationTokenRepository.create({
            identifier: email, token: hashToken(rawToken), expires_at
        }, client);

        const resetLink = `${process.env.NEXT_URL}/reset-password?token=${rawToken}`;
        const response = await sendPasswordResetEmail(email, resetLink);

        if (!response.ok) {
            console.error("Error sending verification email:", response.error);
            throw new Error('EMAIL_SEND_FAILED');
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        if (!(error instanceof Error && error.message === 'EMAIL_SEND_FAILED')) console.error(error);
        return genericMessage;
    } finally {
        client.release();
    }

    await regenerateCsrfToken();
    return genericMessage;
}