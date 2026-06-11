'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { FormStateEmailVerification } from '@/_lib/definitions';
import { sendEmailVerification } from '@/_lib/mail';
import { hashToken } from '@/_lib/tokenutils';
import { userRepository } from '@/_lib/userrepositorys';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import crypto from 'crypto';

export async function handleEmailVerification(_: FormStateEmailVerification | undefined, formData: FormData) {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { error: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const email = formData.get('email') as string;
    const rawToken = formData.get('token') as string;

    if (!email && !rawToken) return { error: 'Não autenticado' };

    const isCheckedUserEmail = await userRepository.findByEmail(email);

    if (isCheckedUserEmail?.email_verified) return { error: 'E-mail já verificado!' };

    const hashedToken = hashToken(rawToken);
    const tokenExisting = await verificationTokenRepository.findValidToken(email, hashedToken);

    if (!tokenExisting) return { error: 'Token inválido ou expirado' };

    if (tokenExisting && new Date() > new Date(tokenExisting.expires_at)) {
        await verificationTokenRepository.delete(email, hashedToken);

        const newRawToken = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const verifyLink = `${process.env.NEXT_URL}/verify-email?token=${newRawToken}&email=${email}`;
        const response = await sendEmailVerification(email, verifyLink);

        if (!response.ok) {
            console.error("Error sending verification email:", response.error);
            return { error: 'email-send-error' };
        }

        await verificationTokenRepository.create({
            identifier: email, token: hashToken(newRawToken), expires_at
        });

        return { status: 'verification-link-sent' };
    }

    await userRepository.updateEmailVerified(isCheckedUserEmail.id, new Date());

    await verificationTokenRepository.delete(email, hashedToken);

    await regenerateCsrfToken();

    return { success: 'Success, E-mail verificado.' };
}