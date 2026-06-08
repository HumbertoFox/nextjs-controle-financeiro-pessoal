'use server';

import { inviteMemberSchema, FormStateInviteMember } from '@/_lib/definitions';
import { familyRepository } from '@/_lib/familyrepository';
import { userRepository } from '@/_lib/userrepositorys';
import { sendFamilyInviteEmail } from '@/_lib/mail';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { getUser } from '@/_lib/dal';
import { validateCsrfToken } from '@/_lib/csrf';

export async function inviteMember(_: FormStateInviteMember, formData: FormData): Promise<FormStateInviteMember> {
    const sessionUser = await getUser();
    if (!sessionUser) return { warning: 'Você precisa estar autenticado para realizar esta ação.' };

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { warning: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const validatedFields = inviteMemberSchema.safeParse({
        email: formData.get('email') as string,
        familyId: formData.get('familyId') as string,
    });

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const data = validatedFields.data;

    try {
        const userVerify = await userRepository.findByEmailActive(data.email);
        if (!userVerify) return { warning: 'Usuário não encontrado. Apenas usuários cadastrados podem ser convidados.' };
        if (userVerify.family_id) return { warning: 'Usuário já pertence a uma família.' };

        const family = await familyRepository.findById(data.familyId);
        if (!family) return { warning: 'Família não encontrada.' };

        const rawToken = await verificationTokenRepository.createInviteToken(data.email, data.familyId);

        const inviteLink = `${process.env.NEXT_URL}/invite/accept?email=${encodeURIComponent(data.email)}&token=${rawToken}`;

        const mail = await sendFamilyInviteEmail(data.email, family.name, inviteLink);
        if (!mail.ok) return { warning: 'Erro ao enviar email de convite. Tente novamente.' };

    } catch {
        return { warning: 'Erro ao enviar convite. Tente novamente.' };
    }

    revalidatePath('/dashboard/settings/family');
    return { message: 'Convite enviado com sucesso!' };
}