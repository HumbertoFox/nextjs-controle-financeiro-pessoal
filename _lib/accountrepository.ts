import pool, { QueryExecutor } from '@/_lib/db';
import { Account } from '@/_types';

export const accountRepository = {
    // -------------------------------------------------------------------------
    // Busca contas ativas do usuário
    // -------------------------------------------------------------------------
    async findByUserId(userId: string, client?: QueryExecutor): Promise<Account[]> {
        const executor = client ?? pool;
        const result = await executor.query<Account>(`
            SELECT id, name, type, current_balance::text, initial_balance::text
            FROM accounts
            WHERE user_id = $1
              AND deleted_at IS NULL
            ORDER BY created_at ASC
        `,
            [userId]
        );
        return result.rows;
    },

    // -------------------------------------------------------------------------
    // Cria conta
    // -------------------------------------------------------------------------
    async create(data: {
        userId: string;
        familyId?: string | null;
        name: string;
        type: Account['type'];
        initialBalance: number;
    }, client?: QueryExecutor): Promise<{ id: string; name: string }> {
        const executor = client ?? pool;
        const result = await executor.query<{ id: string; name: string }>(`
            INSERT INTO accounts (user_id, family_id, name, type, initial_balance, current_balance)
            VALUES ($1, $2, $3, $4, $5, $5)
            RETURNING id, name
        `,
            [data.userId, data.familyId ?? null, data.name, data.type, data.initialBalance]
        );
        return result.rows[0];
    },

    // -------------------------------------------------------------------------
    // Soft delete
    // -------------------------------------------------------------------------
    async softDeleteById(id: string, userId: string, client?: QueryExecutor): Promise<boolean> {
        const executor = client ?? pool;
        const result = await executor.query(`
            UPDATE accounts
            SET deleted_at = now()
            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
            RETURNING id
        `,
            [id, userId]
        );
        return (result.rowCount ?? 0) > 0;
    },
};