import pool from '@/_lib/db';
import { VerificationToken } from '@/_types';

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
}