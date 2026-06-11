'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
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

    const tokenRecord = await verificationTokenRepository.findValidTokenOnly(hashedToken);

    if (!tokenRecord) return { warning: 'Token inválido ou expirado.' };

    const email = tokenRecord.identifier;

    const hashedPassword = await hash(password, 12);

    await userRepository.updatePasswordByEmail(email, hashedPassword);

    await verificationTokenRepository.delete(email, hashedToken);

    await regenerateCsrfToken();

    return { message: 'Senha redefinida com sucesso!' };
}