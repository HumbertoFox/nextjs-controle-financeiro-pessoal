'use server';

import { accountRepository } from '@/_lib/accountrepository';
import { getUser } from '@/_lib/dal';
import { AccountType, AccountTypeZod } from '@/_types';
import { revalidatePath } from 'next/cache';

export async function createAccountAction(fd: FormData) {
    const user = await getUser();
    if (!user) return { error: 'Não autorizado.' };

    const name = (fd.get('name') as string)?.trim();
    const type = fd.get('type') as AccountType;
    const initialBalance = parseFloat(fd.get('initialBalance') as string);

    if (!name) return { error: 'Nome obrigatório.' };
    if (!AccountTypeZod.includes(type)) return { error: 'Tipo inválido.' };
    if (isNaN(initialBalance)) return { error: 'Saldo inicial inválido.' };

    try {
        const existing = await accountRepository.findByUserIdAndNameAndType(user.id, name, type);
        if (existing) return { error: 'Já existe uma conta com esse nome e tipo.' };

        await accountRepository.create({
            userId: user.id, name, type, initialBalance
        });
        revalidatePath('/dashboard/transactions');
        return {};
    } catch {
        return { error: 'Erro ao criar conta.' };
    }
}