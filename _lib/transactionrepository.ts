import pool, { QueryExecutor } from '@/_lib/db';
import { TransactionRow, TransactionsPaginated } from '@/_types';

export const transactionRepository = {
    // -------------------------------------------------------------------------
    // Busca paginada de transações com categoria e subcategoria
    // -------------------------------------------------------------------------
    async findByUserIdPaginated(
        userId: string,
        page: number,
        pageSize: number,
        client?: QueryExecutor
    ): Promise<TransactionsPaginated> {
        const executor = client ?? pool;
        const offset = (page - 1) * pageSize;

        const rowsResult = await executor.query<TransactionRow>(`
            SELECT
                t.id,
                t.type,
                t.value::text,
                t.description,
                t.transaction_date::text,
                t.status,
                a.name  AS account_name,
                COALESCE(parent.name, c.name) AS category_name,
                CASE WHEN parent.id IS NOT NULL THEN c.name ELSE NULL END AS subcategory_name
            FROM transactions t
            JOIN accounts    a      ON a.id = t.account_id
            JOIN categories  c      ON c.id = t.category_id
            LEFT JOIN categories parent ON parent.id = c.parent_id
            WHERE t.user_id    = $1
              AND t.deleted_at IS NULL
            ORDER BY t.transaction_date DESC, t.created_at DESC
            LIMIT  $2
            OFFSET $3
        `,
            [userId, pageSize, offset]
        );

        const countResult = await executor.query<{ count: string }>(`
            SELECT COUNT(*) FROM transactions
            WHERE user_id = $1 AND deleted_at IS NULL
        `,
            [userId]
        );

        return {
            rows: rowsResult.rows,
            total: parseInt(countResult.rows[0].count, 10),
        };
    },

    // -------------------------------------------------------------------------
    // Cria transação e atualiza saldo da conta atomicamente
    // -------------------------------------------------------------------------
    async create(data: {
        userId: string;
        accountId: string;
        categoryId: string;
        type: 'REVENUE' | 'EXPENSE';
        value: number;
        description?: string | null;
        transactionDate: string;
        status?: 'PENDING' | 'CONFIRMED';
    }, client?: QueryExecutor): Promise<{ id: string }> {
        const executor = client ?? pool;

        const result = await executor.query<{ id: string }>(`
            INSERT INTO transactions
                (user_id, account_id, category_id, type, value, description, transaction_date, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `,
            [
                data.userId,
                data.accountId,
                data.categoryId,
                data.type,
                data.value,
                data.description ?? null,
                data.transactionDate,
                data.status ?? 'CONFIRMED',
            ]
        );

        // atualiza saldo da conta
        const delta = data.type === 'REVENUE' ? data.value : -data.value;
        await executor.query(`
            UPDATE accounts
            SET current_balance = current_balance + $1
            WHERE id = $2
        `,
            [delta, data.accountId]
        );

        return result.rows[0];
    },

    // -------------------------------------------------------------------------
    // Soft delete e reverte saldo
    // -------------------------------------------------------------------------
    async softDeleteById(id: string, userId: string, client?: QueryExecutor): Promise<boolean> {
        const executor = client ?? pool;

        const tx = await executor.query<{
            account_id: string; type: string; value: string; status: string;
        }>(`
            SELECT account_id, type, value::text, status
            FROM transactions
            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
        `,
            [id, userId]
        );

        if (!tx.rows[0]) return false;
        const { account_id, type, value, status } = tx.rows[0];

        await executor.query(`
            UPDATE transactions SET deleted_at = now() WHERE id = $1
        `, [id]);

        // reverte saldo só se estava confirmada
        if (status === 'CONFIRMED') {
            const delta = type === 'REVENUE' ? -parseFloat(value) : parseFloat(value);
            await executor.query(`
                UPDATE accounts
                SET current_balance = current_balance + $1
                WHERE id = $2
            `, [delta, account_id]);
        }

        return true;
    },
};