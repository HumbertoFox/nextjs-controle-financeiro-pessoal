import pool from '@/_lib/db';
import { VerificationToken } from '@/_types';
import { hashToken } from './tokenutils';
import crypto from 'crypto';

export const verificationTokenRepository = {
    // -------------------------------------------------------------------------
    // Busca o token mais recente e válido por identifier (não expirado)
    // -------------------------------------------------------------------------
    async findByIdentifier(identifier: string) {
        const result = await pool.query<VerificationToken>(`
            SELECT *
            FROM verification_tokens
            WHERE identifier = $1
                AND expires_at > NOW()
            ORDER BY expires_at DESC
            LIMIT 1
        `,
            [identifier]
        );

        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Valida token por identifier + hash (verificação completa)
    // -------------------------------------------------------------------------
    async findValidToken(identifier: string, hashedToken: string) {
        const result = await pool.query<VerificationToken>(`
            SELECT *
            FROM verification_tokens
            WHERE identifier = $1
              AND token = $2
              AND expires_at > NOW()
            LIMIT 1
        `,
            [identifier, hashedToken]
        );

        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Valida token apenas pelo hash (sem identifier — ex: magic link direto)
    // -------------------------------------------------------------------------
    async findValidTokenOnly(hashedToken: string) {
        const result = await pool.query<VerificationToken>(`
            SELECT *
            FROM verification_tokens
            WHERE token = $1
              AND expires_at > NOW()
            LIMIT 1
        `,
            [hashedToken]
        );

        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Cria um novo token de verificação
    // -------------------------------------------------------------------------
    async create(data: {
        identifier: string;
        token: string;
        expires_at: string;
    }) {
        const result = await pool.query<VerificationToken>(`
            INSERT INTO verification_tokens ( identifier, token, expires_at )
            VALUES ( $1, $2, $3 )
            RETURNING *
        `,
            [data.identifier, data.token, data.expires_at]
        );

        return result.rows[0];
    },

    // -------------------------------------------------------------------------
    // Remove todos os tokens de um identifier (ex: reenvio de email)
    // -------------------------------------------------------------------------
    async deleteByIdentifier(identifier: string) {
        await pool.query(`
            DELETE FROM verification_tokens
            WHERE identifier = $1
        `,
            [identifier]
        );
    },

    // -------------------------------------------------------------------------
    // Remove token específico por identifier + hash (após uso bem-sucedido)
    // -------------------------------------------------------------------------
    async delete(identifier: string, hashedToken: string) {
        await pool.query(`
            DELETE FROM verification_tokens
            WHERE identifier = $1
              AND token = $2
        `,
            [identifier, hashedToken]
        );
    },

    // -------------------------------------------------------------------------
    // Cria token de convite para ingresso em família (expira em 24h)
    // Identifier composto: "email:familyId" para associar o convite à família
    // Remove convite anterior do mesmo email antes de criar o novo
    // -------------------------------------------------------------------------
    async createInviteToken(email: string, familyId: string): Promise<string> {
        const raw = crypto.randomBytes(32).toString('hex');
        const hashed = hashToken(raw);
        const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const identifier = `${email}:${familyId}`;

        // Remove convite anterior para o mesmo email
        await pool.query(`
            DELETE FROM verification_tokens
            WHERE identifier LIKE $1
        `,
            [`${email}:%`]
        );

        await pool.query(`
        INSERT INTO verification_tokens (identifier, token, expires_at)
        VALUES ($1, $2, $3)
        `,
            [identifier, hashed, expires_at]
        );

        return raw;
    },

    // -------------------------------------------------------------------------
    // Busca e valida token de convite
    // -------------------------------------------------------------------------
    async findInviteToken(email: string, token: string) {
        const hashed = hashToken(token);

        const result = await pool.query<VerificationToken>(`
            SELECT *
            FROM verification_tokens
            WHERE identifier LIKE $1
                AND token = $2
                AND expires_at > now()
        `,
            [`${email}:%`, hashed]
        );

        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Deleta token de convite após uso
    // -------------------------------------------------------------------------
    async deleteInviteToken(email: string) {
        await pool.query(`
            DELETE FROM verification_tokens
            WHERE identifier LIKE $1
        `,
            [`${email}:%`]
        );
    },
}