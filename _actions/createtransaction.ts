'use server';

import { getUser } from '@/_lib/dal';
import { transactionRepository } from '@/_lib/transactionrepository';
import { isValidUUID } from '@/_lib/useful';
import { TransactionType, TransactionTypeZod } from '@/_types';
import { revalidatePath } from 'next/cache';

export async function createTransactionAction(fd: FormData) {
    const user = await getUser();
    if (!user) return { error: 'Não autorizado.' };

    const accountId = fd.get('accountId') as string;
    const categoryId = fd.get('categoryId') as string;
    const type = fd.get('type') as TransactionType;
    const value = parseFloat(fd.get('value') as string);
    const transactionDate = fd.get('transactionDate') as string;
    const description = (fd.get('description') as string) || null;

    if (!isValidUUID(accountId) || !isValidUUID(categoryId)) return { error: 'Dados inválidos.' };
    if (!TransactionTypeZod.includes(type)) return { error: 'Tipo inválido.' };
    if (isNaN(value) || value <= 0) return { error: 'Valor inválido.' };
    if (!transactionDate) return { error: 'Data obrigatória.' };

    try {
        await transactionRepository.create({
            userId: user.id, accountId, categoryId, type, value, description, transactionDate
        });
        revalidatePath('/dashboard/transactions');
        return {};
    } catch {
        return { error: 'Erro ao salvar transação.' };
    }
}