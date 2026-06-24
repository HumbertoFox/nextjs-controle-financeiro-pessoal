'use server';

import { getUser } from '@/_lib/dal';
import { sendEmailVerification } from '@/_lib/mail';
import crypto from 'crypto';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { userRepository } from '@/_lib/userrepositorys';
import { hashToken } from '@/_lib/tokenutils';
import { getTransactionClient } from '@/_lib/db';

export async function emailVerifiedChecked() {
    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.email) return null;

    const email = sessionUser.email;

    const client = await getTransactionClient();
    let rawToken: string | undefined;
    let shouldSendEmail = false;

    try {
        await client.query('BEGIN');

        const user = await userRepository.findByEmail(email, client);
        if (user?.email_verified) {
            await client.query('ROLLBACK');
            return null;
        }

        const tokenExisting = await verificationTokenRepository.findByIdentifier(email, client);

        // Token válido já existe — não reenvia
        if (tokenExisting && new Date() < new Date(tokenExisting.expires_at)) {
            await client.query('COMMIT');
            return 'verification-link-sent';
        }

        // Token expirado — limpa antes de recriar
        if (tokenExisting) await verificationTokenRepository.deleteByIdentifier(email);

        // Cria novo token e envia email (token inexistente ou expirado)
        rawToken = crypto.randomBytes(32).toString('hex');
        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        await verificationTokenRepository.create({
            identifier: email, token: hashToken(rawToken), expires_at
        }, client);

        shouldSendEmail = true;
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Failed to prepare verification token:', error);
        return 'verification-error';
    } finally {
        client.release();
    }

    // E-mail é enviado fora da transação de banco (chamada de rede externa).
    if (shouldSendEmail && rawToken) {
        const encodedEmail = encodeURIComponent(email);
        const verifyLink = `${process.env.NEXT_URL}/verify-email?token=${rawToken}&email=${encodedEmail}`;
        const verifySessionLink = `${process.env.NEXT_URL}/dashboard/settings/verify-email?token=${rawToken}&email=${encodedEmail}`;

        const emailResult = await sendEmailVerification(email, verifyLink, verifySessionLink);

        if (!emailResult.ok) {
            console.error('Failed to send verification email:', emailResult.error);
            return 'verification-error';
        }
    }

    return 'verification-link-sent';
}