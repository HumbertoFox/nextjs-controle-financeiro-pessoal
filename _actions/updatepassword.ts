'use server';

import { getUser } from '@/_lib/dal';
import { FormStatePasswordUpdate, passwordUpdateSchema } from '@/_lib/definitions';
import { compare, hash } from 'bcrypt-ts';
import { redirect } from 'next/navigation';
import z from 'zod';
import { userRepository } from '@/_lib/userrepositorys';
import { revalidatePath } from 'next/cache';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { getTransactionClient } from '@/_lib/db';
import { User, UserRole } from '@/_types';
import { createSession } from '@/_lib/session';

export async function updatePassword(_: FormStatePasswordUpdate, formData: FormData): Promise<FormStatePasswordUpdate> {
    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return redirect('/logout');

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { message: false };

    const validatedFields = passwordUpdateSchema.safeParse({
        current_password: formData.get('current_password') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { current_password, password } = validatedFields.data;

    const client = await getTransactionClient();
    let authUser: User;
    let userRole: UserRole;


    try {
        await client.query('BEGIN');

        authUser = await userRepository.findActiveById(sessionUser.id, client);

        if (!authUser) {
            await client.query('ROLLBACK');
            return redirect('/logout');
        }

        const isValid = await compare(current_password, authUser.password);

        if (!isValid) {
            await client.query('ROLLBACK');
            return { errors: { current_password: ['A senha atual está incorreta.'] } };
        }

        if (current_password === password) {
            await client.query('ROLLBACK');
            return { errors: { password: ['A nova senha não pode ser igual à antiga.'] } };
        }

        const hashedPassword = await hash(password, 12);

        await userRepository.updatePassword(sessionUser.id, hashedPassword, client);

        userRole = authUser.role;

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(error);
        return { errors: { current_password: ['Algo deu errado. Por favor, tente novamente mais tarde.'] } };
    } finally {
        client.release();
    }

    try {
        const sessionVerssion = await userRepository.incrementSessionVersion(authUser.id, client);
        await createSession(authUser.id, userRole, sessionVerssion);
    } catch (sessionError) {
        console.error('Failed to reissue session after password update:', sessionError);
    }

    revalidatePath('/dashboard/settings/password');

    await regenerateCsrfToken();

    return { message: true, ts: Date.now() };
}