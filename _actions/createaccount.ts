'use server';

import { accountRepository } from '@/_lib/accountrepository';
import { getUser } from '@/_lib/dal';
import { createAccountActionSharm, FormcreateAccountAction } from '@/_lib/definitions';
import { AccountType } from '@/_types';
import { revalidatePath } from 'next/cache';
import z from 'zod';

export async function createAccountAction(_: FormcreateAccountAction, formData: FormData): Promise<FormcreateAccountAction> {
    const user = await getUser();
    if (!user) return { error: 'Não autorizado.' };

    const validatedFields = createAccountActionSharm.safeParse({
        name: (formData.get('name') as string)?.trim(),
        type: formData.get('type') as AccountType,
        initialBalance: parseFloat(formData.get('initialBalance') as string)
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const data = validatedFields.data;

    try {
        const existing = await accountRepository.findByUserIdAndNameAndType(user.id, data.name, data.type);
        if (existing) return { error: 'Já existe uma conta com esse nome e tipo.' };

        await accountRepository.create({
            userId: user.id, name: data.name, type: data.type, initialBalance: data.initialBalance
        });

        revalidatePath('/dashboard/transactions');
        return { success: 'Conta criada com sucesso.' };
    } catch {
        return { error: 'Erro ao criar conta.' };
    }
}