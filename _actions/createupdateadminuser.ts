'use server';

import { del, put } from '@vercel/blob';
import { FormStateCreateUpdateAdminUser, getSignUpUpdateSchema } from '@/_lib/definitions';
import crypto from 'crypto';
import * as bcrypt from 'bcrypt-ts';
import z from 'zod';
import sharp from 'sharp';
import { revalidatePath } from 'next/cache';
import { userRepository } from '@/_lib/userrepositorys';
import { getUser } from '@/_lib/dal';
import { regenerateCsrfToken, validateCsrfToken } from '@/_lib/csrf';
import { MAX_DIMENSION, MAX_FILE_SIZE, MIME_TO_EXT } from '@/_types';
import { redirect } from 'next/navigation';
import { familyRepository } from '@/_lib/familyrepository';
import { getTransactionClient, rawPool } from '@/_lib/db';
import { formatBrazilianName } from '@/_lib/useful';
import { verificationTokenRepository } from '@/_lib/verificationtokenrepositorys';
import { hashToken } from '@/_lib/tokenutils';
import { sendCreatedEmailAccountVerification } from '@/_lib/mail';

export async function createUpdateAdminUser(_: FormStateCreateUpdateAdminUser, formData: FormData): Promise<FormStateCreateUpdateAdminUser> {
    const sessionUser = await getUser();
    if (!sessionUser) return { warning: 'Você precisa estar autenticado.' };
    if (sessionUser.role !== 'ADMIN') return { warning: 'Você não tem permissão para realizar esta ação.' };

    const csrfToken = formData.get('csrfToken') as string;
    const isValidCsrf = await validateCsrfToken(csrfToken);
    if (!isValidCsrf) return { warning: 'Token de segurança inválido. Atualize a página e tente novamente.' };

    const schema = getSignUpUpdateSchema(formData);

    const validatedFields = schema.safeParse({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        family_name: (formData.get('family_name') as string) || undefined,
        role: formData.get('role') as string,
        password: formData.get('password') as string,
        password_confirmation: formData.get('password_confirmation') as string,
    });

    const id = formData.get('id') as string | undefined;
    const file = formData.get('file') as File | null;

    function revalidatePaths(role: string) {
        if (role === 'ADMIN') {
            revalidatePath('/dashboard/admins');
        } else {
            revalidatePath('/dashboard/admins/users');
        }
    }

    function getRedirectPath(role: string) {
        return role === 'ADMIN' ? '/dashboard/admins' : '/dashboard/admins/users';
    }

    if (!validatedFields.success) return { errors: z.flattenError(validatedFields.error).fieldErrors };

    const { name, email, family_name, password, role } = validatedFields.data;

    if (file && file.size > 0) {
        if (!(file.type in MIME_TO_EXT)) return { errors: { avatar: ['Somente os formatos JPEG, PNG e WebP são permitidos.'] } };
        if (file.size > MAX_FILE_SIZE) return { errors: { avatar: ['O tamanho da imagem não pode exceder 512 KB.'] } };

        try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const metadata = await sharp(buffer).metadata();
            const { width, height } = metadata;
            if (!width || !height || width > MAX_DIMENSION || height > MAX_DIMENSION) return { errors: { avatar: [`As dimensões da imagem não podem exceder 512x512px. (atual: ${width}x${height})`] } };
        } catch {
            return { errors: { avatar: ['Não foi possível ler o arquivo de imagem.'] } };
        }
    }

    const client = await getTransactionClient();
    let redirectPath: string;

    try {
        await client.query('BEGIN');

        async function uploadAvatar(userId: string, currentAvatar?: string | null): Promise<string> {
            if (currentAvatar) {
                try {
                    await del(currentAvatar);
                } catch (deleteErr) {
                    console.warn('Não foi possível excluir o avatar anterior:', deleteErr);
                }
            }
            const extension = MIME_TO_EXT[file!.type];
            const blob = await put(`avatars/${userId}-${crypto.randomUUID()}.${extension}`, file!, { access: 'public' });
            return blob.url;
        }

        if (id) {
            const userInDb = await userRepository.findActiveById(id);
            if (!userInDb) {
                await client.query('ROLLBACK');
                return { warning: 'Token de segurança inválido. Atualize a página e tente novamente.' };
            }

            const existingUser = await userRepository.findByEmail(email);
            if (existingUser && existingUser.id !== id) {
                await client.query('ROLLBACK');
                return { errors: { email: ['Este endereço de e-mail já está em uso.'] } };
            }

            const imageUrl = file && file.size > 0 ? await uploadAvatar(id, userInDb.avatar) : undefined;
            const emailChanged = userInDb.email !== email;
            const hashedPassword = password ? await bcrypt.hash(password, 12) : undefined;

            const hasFieldChanges =
                userInDb.name !== name ||
                emailChanged ||
                userInDb.role !== role ||
                !!hashedPassword ||
                imageUrl !== undefined;

            if (!hasFieldChanges) {
                await client.query('ROLLBACK');
                return { warning: 'No changes were detected.' };
            }

            const updatedUser = await userRepository.updateByAdminUser(id, {
                name, email, role, ...(hashedPassword && { password: hashedPassword }), ...(imageUrl && { avatar: imageUrl }),
            }, client);

            if (!updatedUser) return { warning: 'Falha ao atualizar o usuário. Tente novamente.' };
            revalidatePaths(updatedUser.role);
            redirectPath = getRedirectPath(updatedUser.role);
        } else {
            const existingUser = await userRepository.findByEmail(email, client);
            if (existingUser) {
                await client.query('ROLLBACK');
                return { errors: { email: ['Este endereço de e-mail já está em uso!'] } };
            }

            if (!password) {
                await client.query('ROLLBACK');
                return { errors: { password: ['A senha deve ter pelo menos 8 caracteres.'] } };
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            if (!hashedPassword) return { errors: { password: ['A senha deve ter pelo menos 8 caracteres.'] } };

            const newUser = await userRepository.create({
                name: formatBrazilianName(name), email, password: hashedPassword, role
            }, client);

            if (role === 'MEMBER' && family_name) {
                const client = await rawPool.connect();
                try {
                    await client.query('BEGIN');
                    await familyRepository.create({ name: formatBrazilianName(family_name), ownerId: newUser.id }, client);
                    await client.query('COMMIT');
                } catch (e) {
                    await client.query('ROLLBACK');
                    throw e;
                } finally {
                    client.release();
                }
            }

            await verificationTokenRepository.deleteByIdentifier(email, client);

            const rawToken = crypto.randomBytes(32).toString('hex');
            const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            await verificationTokenRepository.create({
                identifier: email, token: hashToken(rawToken), expires_at
            }, client);

            const encodedEmail = encodeURIComponent(email);
            const verifyLink = `${process.env.NEXT_URL}/verify-email?token=${rawToken}&email=${encodedEmail}`;
            const verifySessionLink = `${process.env.NEXT_URL}/dashboard/settings/verify-email?token=${rawToken}&email=${encodedEmail}`;

            const emailResult = await sendCreatedEmailAccountVerification(email, verifyLink, verifySessionLink);

            if (!emailResult.ok) {
                console.error('Failed to send verification email:', emailResult.error);
                throw new Error('EMAIL_SEND_FAILED');
            }

            if (file && file.size > 0) {
                const imageUrl = await uploadAvatar(newUser.id);
                await userRepository.updateAvatar(newUser.id, imageUrl);
            }

            revalidatePaths(newUser.role);
            redirectPath = getRedirectPath(newUser.role);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');

        if (error instanceof Error && error.message === 'EMAIL_SEND_FAILED') {
            return { warning: 'Não foi possível enviar o e-mail de verificação. Por favor, tente novamente mais tarde.' };
        }
        console.error(error);
        return { warning: 'Ocorreu um erro inesperado. Tente novamente.' };
    }

    await regenerateCsrfToken();
    if (redirectPath) redirect(redirectPath);
}