'use server';

import { put } from '@vercel/blob';
import { createAdminSchema, FormStateCreateAdmin } from '@/_lib/definitions';
import { createSession } from '@/_lib/session';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import sharp from 'sharp';
import { userRepository } from '@/_lib/userrepositorys';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { MAX_DIMENSION, MAX_FILE_SIZE, MIME_TO_EXT, UserRole } from '@/_types';
import { redirect } from 'next/navigation';
import { formatBrazilianName } from '@/_lib/useful';

export async function createAdmin(_: FormStateCreateAdmin, formData: FormData): Promise<FormStateCreateAdmin> {
    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);

    if (!isValidCsrf) return { warning: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const validatedFields = createAdminSchema.safeParse({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string,
    });

    const file = formData.get('file') as File | null;

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { name, email, password } = validatedFields.data;

    try {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser) return { warning: 'Dados já cadastrados.' };

        const adminExists = await userRepository.adminExists();
        const role: UserRole = adminExists ? 'INDIVIDUAL' : 'ADMIN';

        const hashedPassword = await bcrypt.hash(password, 12);

        if (file && file.size > 0) {
            if (!(file.type in MIME_TO_EXT)) return { errors: { avatar: ['Somente os formatos JPEG, PNG ou WebP são permitidos.'] } };
            if (file.size > MAX_FILE_SIZE) return { errors: { avatar: ['A imagem não pode exceder 512 KB.'] } };

            try {
                const buffer = Buffer.from(await file.arrayBuffer());
                const metadata = await sharp(buffer).metadata();
                const { width, height } = metadata;
                if (!width || !height || width > MAX_DIMENSION || height > MAX_DIMENSION) return { errors: { avatar: [`A imagem não pode exceder 512x512px. (atual: ${width}x${height})`] } };
            } catch {
                return { errors: { avatar: ['Não foi possível ler a imagem.'] } };
            }
        }

        const user = await userRepository.create({
            name: formatBrazilianName(name), email, password: hashedPassword, role
        });

        if (file && file.size > 0) {
            const extension = MIME_TO_EXT[file.type];
            const blob = await put(`avatars/${user.id}-${crypto.randomUUID()}.${extension}`, file, {
                access: 'public',
            });

            await userRepository.updateAvatar(user.id, blob.url);
        }

        const sessionVersion = await userRepository.incrementSessionVersion(user.id);

        await createSession(user.id, user.role, sessionVersion);
    } catch (error) {
        console.error(error);
        return { warning: 'Algo deu errado. Por favor, tente novamente mais tarde.' };
    }

    await regenerateCsrfToken();
    redirect('/dashboard');
}