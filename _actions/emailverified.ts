'use server';

import { getUser } from '@/_lib/dal';
import { sendEmailVerification } from '@/_lib/mail';
import crypto from 'crypto';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { userRepository } from '@/_lib/userrepositorys';
import { hashToken } from '@/_lib/tokenutils';

export async function emailVerifiedChecked() {
    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.email) return null;

    const email = sessionUser.email;

    const user = await userRepository.findByEmail(email);
    if (user?.email_verified) return null;

    const tokenExisting = await verificationTokenRepository.findByIdentifier(email);

    // Token válido já existe — não reenvia
    if (tokenExisting && new Date() < new Date(tokenExisting.expires_at)) return 'verification-link-sent';

    // Token expirado — limpa antes de recriar
    if (tokenExisting) await verificationTokenRepository.deleteByIdentifier(email);

    // Cria novo token e envia email (token inexistente ou expirado)
    const rawToken = crypto.randomBytes(32).toString('hex');
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await verificationTokenRepository.create({
        identifier: email, token: hashToken(rawToken), expires_at,
    });

    const verifyLink = `${process.env.NEXT_URL}/verify-email?token=${rawToken}&email=${email}`;
    const verifySessionLink = `${process.env.NEXT_URL}/dashboard/settings/verify-email?token=${rawToken}&email=${email}`;
    await sendEmailVerification(email, verifyLink, verifySessionLink);

    return 'verification-link-sent';
}