'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { getTransactionClient } from '@/_lib/db';
import { FormStateEmailVerification } from '@/_lib/definitions';
import { hashToken } from '@/_lib/tokenutils';
import { userRepository } from '@/_lib/userrepositorys';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';

export async function handleEmailVerification(_: FormStateEmailVerification | undefined, formData: FormData) {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { error: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const email = formData.get('email') as string;
    const rawToken = formData.get('token') as string;

    if (!email && !rawToken) return { error: 'Não autenticado' };

    const client = await getTransactionClient();

    try {
        await client.query('BEGIN');

        const isCheckedUserEmail = await userRepository.findByEmail(email, client);

        if (isCheckedUserEmail?.email_verified) {
            await client.query('ROLLBACK');
            return { error: 'E-mail já verificado!' };
        }

        const hashedToken = hashToken(rawToken);
        const tokenExisting = await verificationTokenRepository.findValidToken(email, hashedToken, client);

        if (!tokenExisting) {
            await client.query('ROLLBACK');
            return { error: 'Token inválido ou expirado' };
        }

        if (!isCheckedUserEmail) {
            await client.query('ROLLBACK');
            return { error: 'Invalid or expired token' };
        }

        await userRepository.updateEmailVerified(isCheckedUserEmail.id, new Date(), client);
        await verificationTokenRepository.delete(email, hashedToken, client);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return { error: 'An unexpected error occurred. Please try again.' };
    } finally {
        client.release();
    }

    await regenerateCsrfToken();

    return { success: 'Success, E-mail verificado.' };
}