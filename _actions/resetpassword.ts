'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { getTransactionClient } from '@/_lib/db';
import { FormStatePasswordReset, passwordResetSchema } from '@/_lib/definitions';
import { hashToken } from '@/_lib/tokenutils';
import { userRepository } from '@/_lib/userrepositorys';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { hash } from 'bcrypt-ts';
import z from 'zod';

export async function resetPassword(_: FormStatePasswordReset, formData: FormData): Promise<FormStatePasswordReset> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { warning: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const validatedFields = passwordResetSchema.safeParse({
        token: formData.get('token') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { token, password } = validatedFields.data;

    const hashedToken = hashToken(token);

    const client = await getTransactionClient();

    try {
        await client.query('BEGIN');

        const tokenRecord = await verificationTokenRepository.findValidTokenOnly(hashedToken, client);

        if (!tokenRecord) {
            await client.query('ROLLBACK');
            return { warning: 'Token inválido ou expirado.' };
        }

        const email = tokenRecord.identifier;

        const hashedPassword = await hash(password, 12);

        await userRepository.updatePasswordByEmail(email, hashedPassword, client);

        await verificationTokenRepository.delete(email, hashedToken, client);

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return { warning: 'Algo deu errado. Por favor, tente novamente mais tarde.' };
    } finally {
        client.release();
    }

    await regenerateCsrfToken();

    return { message: 'Senha redefinida com sucesso!' };
}