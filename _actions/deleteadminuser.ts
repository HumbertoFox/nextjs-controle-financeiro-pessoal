'use server';

import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { getUser } from '@/_lib/dal';
import { userRepository } from '@/_lib/userrepositorys';
import { revalidatePath } from 'next/cache';

export async function deleteUserById(formData: FormData) {
    const sessionUser = await getUser();
    if (!sessionUser || sessionUser.role !== 'ADMIN') return;

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return;

    const userId = formData.get('userId') as string;

    if (!userId) return;

    try {
        const user = await userRepository.findActiveById(userId);

        if (!user) return;

        await userRepository.softDeleteById(userId);

        await regenerateCsrfToken();

        switch (user.role) {
            case 'ADMIN':
                revalidatePath('/dashboard/admins');
                break;
            case 'INDIVIDUAL':
                revalidatePath('/dashboard/users');
                break;
            case 'MEMBER':
                revalidatePath('/dashboard/users');
                break;
            default:
                revalidatePath('/dashboard/layout');
                break;
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}