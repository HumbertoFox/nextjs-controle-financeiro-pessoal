import pool, { QueryExecutor } from '@/_lib/db';
import { TransactionRow, TransactionsPaginated, TransactionStatus, TransactionType } from '@/_types';

export const transactionRepository = {
    // -------------------------------------------------------------------------
    // Busca paginada de transações com categoria, subcategoria, sub-subcategoria e parcelas
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
                t.installment_number,
                t.installments_total,
                a.name AS account_name,
                COALESCE(gp.name, p.name, c.name) AS category_name,
                CASE
                    WHEN gp.id IS NOT NULL THEN p.name
                    WHEN p.id  IS NOT NULL THEN c.name
                    ELSE NULL
                END AS subcategory_name,
                CASE
                    WHEN gp.id IS NOT NULL THEN c.name
                    ELSE NULL
                END AS subsubcategory_name
            FROM transactions t
            JOIN accounts    a  ON a.id = t.account_id
            JOIN categories  c  ON c.id = t.category_id
            LEFT JOIN categories p  ON p.id  = c.parent_id
            LEFT JOIN categories gp ON gp.id = p.parent_id
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
    // Busca paginada de transações de um mês/ano específico (padrão: mês atual),
    // com categoria e subcategoria resolvidas via hierarquia
    // -------------------------------------------------------------------------
    async findByUserIdMonthPaginated(
        userId: string,
        page: number,
        pageSize: number,
        month?: number,
        year?: number,
        client?: QueryExecutor
    ): Promise<TransactionsPaginated> {
        const executor = client ?? pool;
        const offset = (page - 1) * pageSize;

        const now = new Date();
        const targetMonth = month ?? now.getMonth() + 1;
        const targetYear = year ?? now.getFullYear();

        const rowsResult = await executor.query<TransactionRow>(`
            SELECT
                t.id,
                t.type,
                t.value::text,
                t.description,
                t.transaction_date::text,
                t.status,
                a.name AS account_name,
                COALESCE(gp.name, p.name, c.name) AS category_name,
                CASE
                    WHEN gp.id IS NOT NULL THEN p.name
                    WHEN p.id  IS NOT NULL THEN c.name
                    ELSE NULL
                END AS subcategory_name,
                CASE
                    WHEN gp.id IS NOT NULL THEN c.name
                    ELSE NULL
                END AS subsubcategory_name
            FROM transactions t
            JOIN accounts    a  ON a.id = t.account_id
            JOIN categories  c  ON c.id = t.category_id
            LEFT JOIN categories p  ON p.id  = c.parent_id
            LEFT JOIN categories gp ON gp.id = p.parent_id
            WHERE t.user_id    = $1
              AND t.deleted_at IS NULL
              AND EXTRACT(MONTH FROM t.transaction_date) = $4
              AND EXTRACT(YEAR  FROM t.transaction_date) = $5
            ORDER BY t.transaction_date DESC, t.created_at DESC
            LIMIT  $2
            OFFSET $3
        `,
            [userId, pageSize, offset, targetMonth, targetYear]
        );

        const countResult = await executor.query<{ count: string }>(`
            SELECT COUNT(*) FROM transactions
            WHERE user_id = $1
                AND deleted_at IS NULL
                AND EXTRACT(MONTH FROM transaction_date) = $2
                AND EXTRACT(YEAR  FROM transaction_date) = $3
        `,
            [userId, targetMonth, targetYear]
        );

        return {
            rows: rowsResult.rows,
            total: parseInt(countResult.rows[0].count, 10),
        };
    },

    // -------------------------------------------------------------------------
    // Busca o total de gastos agrupados por categoria raiz utilizando a View
    // -------------------------------------------------------------------------
    async getDashboardExpensesByCategory(
        userId: string,
        month: number,
        year: number,
        client?: QueryExecutor
    ): Promise<{ category_name: string; total_value: number }[]> {
        const executor = client ?? pool;

        const result = await executor.query<{ category_name: string; total_value: string }>(`
            SELECT 
                v.root_name AS category_name,
                SUM(t.value) AS total_value
            FROM transactions t
            JOIN view_categories_root_mapping v ON v.category_id = t.category_id
            WHERE t.user_id = $1
              AND t.type = 'EXPENSE'
              AND t.deleted_at IS NULL
              AND EXTRACT(MONTH FROM t.transaction_date) = $2
              AND EXTRACT(YEAR FROM t.transaction_date) = $3
            GROUP BY v.root_name
            ORDER BY total_value DESC
        `,
            [userId, month, year]
        );

        return result.rows.map(row => ({
            category_name: row.category_name,
            total_value: parseFloat(row.total_value)
        }));
    },

    // -------------------------------------------------------------------------
    // Cria transação (ou parcelas) e atualiza saldo da conta de forma atômica
    // -------------------------------------------------------------------------
    async create(data: {
        userId: string;
        accountId: string;
        categoryId: string;
        type: TransactionType;
        value: number;
        description?: string | null;
        transactionDate: string;
        status?: TransactionStatus;
        installmentsTotal?: number | null;
    }, client?: QueryExecutor): Promise<{ id: string }> {
        const executor = client ?? pool;

        const totalInstallments = data.installmentsTotal && data.installmentsTotal > 1 ? data.installmentsTotal : 1;
        const isInstallment = totalInstallments > 1;
        const installmentGroupId = isInstallment ? crypto.randomUUID() : null;

        let firstTransactionId = '';

        const shouldManageTransaction = !client;
        if (shouldManageTransaction) {
            await pool.query('BEGIN');
        }

        try {
            const baseDate = new Date(data.transactionDate + 'T00:00:00');

            for (let i = 0; i < totalInstallments; i++) {
                const installmentNumber = isInstallment ? i + 1 : null;

                // Calcula as datas subsequentes (D+0, D+1 mês, D+2 meses...)
                const currentDate = new Date(baseDate);
                currentDate.setMonth(baseDate.getMonth() + i);
                const dateString = currentDate.toISOString().slice(0, 10);

                const result = await executor.query<{ id: string }>(`
                    INSERT INTO transactions
                        (user_id, account_id, category_id, type, value, description, transaction_date, status, installment_group_id, installment_number, installments_total)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                    RETURNING id
                `,
                    [
                        data.userId,
                        data.accountId,
                        data.categoryId,
                        data.type,
                        data.value,
                        data.description ?? null,
                        dateString,
                        data.status ?? 'CONFIRMED',
                        installmentGroupId,
                        installmentNumber,
                        isInstallment ? totalInstallments : null
                    ]
                );

                if (i === 0) {
                    firstTransactionId = result.rows[0].id;
                }
            }

            const totalValueInserted = data.value * totalInstallments;
            const delta = data.type === 'REVENUE' ? totalValueInserted : -totalValueInserted;

            await executor.query(`
                UPDATE accounts
                SET current_balance = current_balance + $1
                WHERE id = $2
            `,
                [delta, data.accountId]
            );

            if (shouldManageTransaction) {
                await pool.query('COMMIT');
            }

            return { id: firstTransactionId };
        } catch (error) {
            if (shouldManageTransaction) {
                await pool.query('ROLLBACK');
            }
            throw error;
        }
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