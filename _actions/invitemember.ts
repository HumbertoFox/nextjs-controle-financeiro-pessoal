'use server';

import { inviteMemberSchema, FormStateInviteMember } from '@/_lib/definitions';
import { familyRepository } from '@/_lib/familyrepository';
import { userRepository } from '@/_lib/userrepositorys';
import { sendFamilyInviteEmail } from '@/_lib/mail';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';

export async function inviteMember(_: FormStateInviteMember, formData: FormData): Promise<FormStateInviteMember> {
    const validated = inviteMemberSchema.safeParse({
        email: formData.get('email'),
    });

    if (!validated.success) return { errors: z.flattenError(validated.error).fieldErrors };

    const familyId = formData.get('familyId') as string;

    try {
        const user = await userRepository.findByEmailActive(validated.data.email);
        if (!user) return { warning: 'Usuário não encontrado. Apenas usuários cadastrados podem ser convidados.' };
        if (user.family_id) return { warning: 'Usuário já pertence a uma família.' };

        const family = await familyRepository.findById(familyId);
        if (!family) return { warning: 'Família não encontrada.' };

        const rawToken = await verificationTokenRepository.createInviteToken(validated.data.email, familyId);

        const inviteLink = `${process.env.NEXT_URL}/invite/accept?email=${encodeURIComponent(validated.data.email)}&token=${rawToken}`;

        const mail = await sendFamilyInviteEmail(validated.data.email, family.name, inviteLink);
        if (!mail.ok) return { warning: 'Erro ao enviar email de convite. Tente novamente.' };

    } catch {
        return { warning: 'Erro ao enviar convite. Tente novamente.' };
    }

    revalidatePath('/dashboard/settings/family');
    return { message: 'Convite enviado com sucesso!' };
}