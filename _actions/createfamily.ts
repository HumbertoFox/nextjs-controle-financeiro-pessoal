'use server';

import { rawPool } from '@/_lib/db';
import { createFamilySchema, FormStateCreateFamily } from '@/_lib/definitions';
import { familyRepository } from '@/_lib/familyrepository';
import { formatBrazilianName } from '@/_lib/useful';
import { userRepository } from '@/_lib/userrepositorys';
import { getUser } from '@/_lib/dal';
import { validateCsrfToken } from '@/_lib/csrf';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createFamily(_: FormStateCreateFamily, formData: FormData): Promise<FormStateCreateFamily> {
    const sessionUser = await getUser();
    if (!sessionUser) return { warning: 'Você precisa estar autenticado para realizar esta ação.' };

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { warning: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const validated = createFamilySchema.safeParse({
        name: formData.get('name'),
    });

    if (!validated.success) return { errors: z.flattenError(validated.error).fieldErrors };

    const data = validated.data;

    try {
        const existingUser = await userRepository.findActiveById(sessionUser.id);
        if (!existingUser) return { warning: 'Usuário não encontrado.' };
        if (existingUser.family_id) return { warning: 'Usuário já está associado a uma família.' };

        const client = await rawPool.connect();
        try {
            await client.query('BEGIN');
            await familyRepository.create({
                name: formatBrazilianName(data.name), ownerId: sessionUser.id,
            }, client);
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch {
        return { warning: 'Erro ao criar família. Tente novamente.' };
    }

    revalidatePath('/dashboard/settings/family');
    return { message: 'Família criada com sucesso!' };
}