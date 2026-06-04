'use server';

import { getUser } from '@/_lib/dal';
import { FormStateUserUpdate, updateUserSchema } from '@/_lib/definitions';
import { redirect } from 'next/navigation';
import z from 'zod';
import { put, del } from '@vercel/blob';
import { userRepository } from '@/_lib/userrepositorys';
import { revalidatePath } from 'next/cache';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { MIME_TO_EXT } from '@/_types';

const MAX_FILE_SIZE = 512 * 1024;

export async function updateUser(_: FormStateUserUpdate, formData: FormData): Promise<FormStateUserUpdate> {
    const sessionUser = await getUser();
    if (!sessionUser || !sessionUser?.id) return redirect('/');

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { success: false };

    const validatedFields = updateUserSchema.safeParse({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
    });

    const file = formData.get('file') as File | null;

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { name, email } = validatedFields.data;

    const emailInUse = await userRepository.findByEmailActive(email);

    if (emailInUse && emailInUse.id !== sessionUser.id) return { errors: { email: ['This email address is already in use.'] } };

    const dataToUpdate: { name?: string, email?: string, avatar?: string | null } = {};
    if (sessionUser.name !== name) dataToUpdate.name = name;
    if (sessionUser.email !== email) dataToUpdate.email = email;

    if (file && file.size > 0) {
        if (!(file.type in MIME_TO_EXT)) return { errors: { avatar: ['Only JPEG, PNG, and WebP formats are allowed.'] } };

        if (file.size > MAX_FILE_SIZE) return { errors: { avatar: ['The image cannot exceed 512 KB.'] } };

        try {
            if (sessionUser.avatar) {
                try {
                    await del(sessionUser.avatar);
                } catch (deleteErr) {
                    console.warn('It was not possible to delete the previous avatar:', deleteErr);
                }
            }

            const extension = MIME_TO_EXT[file!.type];
            const blob = await put(`avatars/${sessionUser.id}-${crypto.randomUUID()}.${extension}`, file!, { access: 'public' });

            if (blob.url) {
                dataToUpdate.avatar = blob.url;
            }
        } catch (error) {
            console.error('Error sending image:', error);
            return { errors: { avatar: ['Error sending image. Please try again.'] } };
        }
    }

    if (Object.keys(dataToUpdate).length === 0) return { message: 'No changes made.' };

    await userRepository.updateByIdUserActive(sessionUser.id, dataToUpdate);

    revalidatePath('/dashboard/settings/profile');

    await regenerateCsrfToken();

    return { success: true };
}