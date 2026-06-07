'use server';

import { rawPool } from '@/_lib/db';
import { createFamilySchema, FormStateCreateFamily } from '@/_lib/definitions';
import { familyRepository } from '@/_lib/familyrepository';
import { formatBrazilianName } from '@/_lib/useful';
import { userRepository } from '@/_lib/userrepositorys';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export async function createFamily(_: FormStateCreateFamily, formData: FormData): Promise<FormStateCreateFamily> {
    const validated = createFamilySchema.safeParse({
        name: formData.get('name'),
    });

    if (!validated.success) return { errors: z.flattenError(validated.error).fieldErrors };

    const data = validated.data;

    const userId = formData.get('userId') as string;

    try {
        const existingUser = await userRepository.findActiveById(userId);
        if (!existingUser) return { warning: 'Usuário não encontrado.' };
        if (existingUser.family_id) return { warning: 'Usuário já está associado a uma família.' };

        const client = await rawPool.connect();
        try {
            await client.query('BEGIN');
            const family = await familyRepository.create({ name: formatBrazilianName(data.name) }, client);
            await familyRepository.assignUser(userId, family.id, client);
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