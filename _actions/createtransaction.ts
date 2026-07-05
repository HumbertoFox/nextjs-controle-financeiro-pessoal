'use server';

import { getUser } from '@/_lib/dal';
import { createTransactionActionSchema, FormStateCreateTransactionAction } from '@/_lib/definitions';
import { transactionRepository } from '@/_lib/transactionrepository';
import { TransactionType } from '@/_types';
import { revalidatePath } from 'next/cache';
import z from 'zod';

export async function createTransactionAction(_: FormStateCreateTransactionAction, formData: FormData): Promise<FormStateCreateTransactionAction> {
    const user = await getUser();
    if (!user) return { error: 'Não autorizado.' };

    const validatedFields = createTransactionActionSchema.safeParse({
        accountId: formData.get('accountId') as string,
        categoryId: formData.get('categoryId') as string,
        type: formData.get('type') as TransactionType,
        value: parseFloat(formData.get('value') as string),
        transactionDate: formData.get('transactionDate') as string,
        description: (formData.get('description') as string) || null
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const data = validatedFields.data;

    try {
        await transactionRepository.create({
            userId: user.id,
            accountId: data.accountId,
            categoryId: data.categoryId,
            type: data.type,
            value: data.value,
            description: data.description,
            transactionDate: data.transactionDate
        });
        revalidatePath('/dashboard/transactions');
        return { success: ' Transação criada com sucesso.' };
    } catch {
        return { error: 'Erro ao salvar transação.' };
    }
}