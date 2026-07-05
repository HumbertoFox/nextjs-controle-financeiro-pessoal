'use server';

import { categoryRepository } from '@/_lib/categoryrepository';
import { getUser } from '@/_lib/dal';
import { createCategoryActionSchema, FormStateCreateCategoryAction } from '@/_lib/definitions';
import { TransactionType } from '@/_types';
import { revalidatePath } from 'next/cache';
import z from 'zod';

export async function createCategoryAction(_: FormStateCreateCategoryAction, formData: FormData): Promise<FormStateCreateCategoryAction> {
    const user = await getUser();
    if (!user) return { error: 'Não Autenticado.' };

    const validatedFields = createCategoryActionSchema.safeParse({
        name: (formData.get('name') as string)?.trim(),
        type: formData.get('type') as TransactionType,
        parentId: (formData.get('parentId') as string) || null
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const data = validatedFields.data;

    try {
        const existing = await categoryRepository.findByUserIdAndNameAndParent(user.id, data.name, data.parentId);
        if (existing) return { error: 'Já existe uma categoria com esse nome neste nível.' };

        await categoryRepository.create({
            userId: user.id, name: data.name, type: data.type, parentId: data.parentId
        });
        
        revalidatePath('/dashboard/transactions');
        return { success: 'Categoria criada com sucesso!' };
    } catch {
        return { error: 'Erro ao criar categoria.' };
    }
}