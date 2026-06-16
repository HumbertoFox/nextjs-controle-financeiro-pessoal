import pool, { QueryExecutor } from '@/_lib/db';
import { Account, AccountType } from '@/_types';

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
    // Verifica se já existe conta ativa com mesmo nome e tipo para o usuário
    // -------------------------------------------------------------------------
    async findByUserIdAndNameAndType(
        userId: string,
        name: string,
        type: AccountType,
        client?: QueryExecutor
    ): Promise<{ id: string } | null> {
        const executor = client ?? pool;
        const result = await executor.query<{ id: string }>(`
        SELECT id
        FROM accounts
        WHERE user_id = $1
          AND lower(name) = lower($2)
          AND type = $3
          AND deleted_at IS NULL
        LIMIT 1
    `,
            [userId, name, type]
        );
        return result.rows[0] ?? null;
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