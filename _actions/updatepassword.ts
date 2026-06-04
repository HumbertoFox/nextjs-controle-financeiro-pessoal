'use server';

import { getUser } from '@/_lib/dal';
import { FormStatePasswordUpdate, passwordUpdateSchema } from '@/_lib/definitions';
import { compare, hash } from 'bcrypt-ts';
import { redirect } from 'next/navigation';
import z from 'zod';
import { userRepository } from '@/_lib/userrepositorys';
import { revalidatePath } from 'next/cache';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';

export async function updatePassword(_: FormStatePasswordUpdate, formData: FormData): Promise<FormStatePasswordUpdate> {
    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return redirect('/');

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

    const authUser = await userRepository.findActiveById(sessionUser.id);

    if (!authUser) return redirect('/');

    const isValid = await compare(current_password, authUser.password);

    if (!isValid) return { errors: { current_password: ['The current password is incorrect.'] } };

    if (current_password === password) return { errors: { password: ['The new password cannot be the same as the old one.'] } };

    const hashedPassword = await hash(password, 12);

    await userRepository.updatePassword(sessionUser.id, hashedPassword);

    revalidatePath('/dashboard/settings/password');

    await regenerateCsrfToken();

    return { message: true };
}