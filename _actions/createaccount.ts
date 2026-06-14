'use server';

import { accountRepository } from '@/_lib/accountrepository';
import { getUser } from '@/_lib/dal';

export async function createAccountAction(fd: FormData) {
    const user = await getUser();
    if (!user) return { error: 'Não autorizado.' };

    const name = (fd.get('name') as string)?.trim();
    const type = fd.get('type') as string;
    const initialBalance = parseFloat(fd.get('initialBalance') as string);

    const validTypes = ['CURRENT', 'SAVINGS', 'CREDIT', 'INVESTMENT', 'DIGITAL'];
    if (!name) return { error: 'Nome obrigatório.' };
    if (!validTypes.includes(type)) return { error: 'Tipo inválido.' };
    if (isNaN(initialBalance)) return { error: 'Saldo inicial inválido.' };

    try {
        await accountRepository.create({
            userId: user.id, name, type: type as Parameters<typeof accountRepository.create>[0]['type'], initialBalance
        });
        return {};
    } catch {
        return { error: 'Erro ao criar conta.' };
    }
}