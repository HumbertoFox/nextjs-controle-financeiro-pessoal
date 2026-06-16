'use server';

import { categoryRepository } from '@/_lib/categoryrepository';
import { getUser } from '@/_lib/dal';
import { isValidUUID } from '@/_lib/useful';
import { TransactionType, TransactionTypeZod } from '@/_types';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(fd: FormData) {
    const user = await getUser();
    if (!user) return { error: 'Não autorizado.' };

    const name = (fd.get('name') as string)?.trim();
    const type = fd.get('type') as TransactionType;
    const parentId = (fd.get('parentId') as string) || null;

    if (!name) return { error: 'Nome obrigatório.' };
    if (!TransactionTypeZod.includes(type)) return { error: 'Tipo inválido.' };
    if (parentId && !isValidUUID(parentId)) return { error: 'Categoria pai inválida.' };

    try {
        const existing = await categoryRepository.findByUserIdAndNameAndParent(user.id, name, parentId);
        if (existing) return { error: 'Já existe uma categoria com esse nome neste nível.' };

        await categoryRepository.create({
            userId: user.id, name, type, parentId
        });
        revalidatePath('/dashboard/transactions');
        return {};
    } catch {
        return { error: 'Erro ao criar categoria.' };
    }
}