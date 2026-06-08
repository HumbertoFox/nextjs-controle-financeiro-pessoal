'use server';

import { validateCsrfToken } from '@/_lib/csrf';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { familyRepository } from '@/_lib/familyrepository';
import { userRepository } from '@/_lib/userrepositorys';
import { revalidatePath } from 'next/cache';
import { FormStateAcceptInvite } from '@/_lib/definitions';

export async function acceptInvite(_: FormStateAcceptInvite, formData: FormData): Promise<FormStateAcceptInvite> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { error: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const email = formData.get('email') as string;
    const rawToken = formData.get('token') as string;

    if (!email || !rawToken) return { error: 'Dados inválidos.' };

    // findInviteToken já faz o hash internamente
    const invite = await verificationTokenRepository.findInviteToken(email, rawToken);
    if (!invite) return { warning: 'Convite inválido ou expirado.' };

    // Extrai familyId do identifier composto "email:familyId"
    const familyId = invite.identifier.split(':')[1];
    if (!familyId) return { error: 'Convite corrompido.' };

    const user = await userRepository.findByEmailActive(email);
    if (!user) return { warning: 'Usuário não encontrado.' };
    if (user.family_id) return { warning: 'Você já pertence a uma família.' };

    await familyRepository.assignUser(user.id, familyId);
    await verificationTokenRepository.deleteInviteToken(email);

    revalidatePath('/dashboard');
    return { success: 'Convite aceito! Faça login para continuar.' };
}