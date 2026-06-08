'use server';

import { getUser } from '@/_lib/dal';
import { validateCsrfToken } from '@/_lib/csrf';
import { familyRepository } from '@/_lib/familyrepository';
import { userRepository } from '@/_lib/userrepositorys';
import { revalidatePath } from 'next/cache';
import { FormStateRemoveMember } from '@/_lib/definitions';

export async function removeFamilyMember(_: FormStateRemoveMember, formData: FormData): Promise<FormStateRemoveMember> {
    const sessionUser = await getUser();
    if (!sessionUser) return { warning: 'Não autenticado.' };

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { warning: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const memberId = formData.get('memberId') as string;
    const familyId = formData.get('familyId') as string;

    if (!memberId || !familyId) return { warning: 'Dados inválidos.' };

    const isOwner = await familyRepository.isOwner(familyId, sessionUser.id);
    if (!isOwner) return { warning: 'Apenas o dono da família pode remover membros.' };

    // Impede o dono de se remover
    if (memberId === sessionUser.id) return { warning: 'O dono não pode ser removido da família.' };

    await userRepository.removeFromFamily(memberId);

    revalidatePath('/dashboard/settings/family');
    return { message: 'Membro removido com sucesso.' };
}