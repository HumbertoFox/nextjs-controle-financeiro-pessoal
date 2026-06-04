import pool, { QueryExecutor } from '@/_lib/db';

export const adminRepository = {
    // -------------------------------------------------------------------------
    // Verifica se existe algum admin ativo
    // -------------------------------------------------------------------------
    async getIsAdmin(client?: QueryExecutor): Promise<boolean | null> {
        const executor = client ?? pool;
        try {
            const result = await executor.query(`
                SELECT 1
                FROM users_admin_public
                WHERE deleted_at IS NULL
                LIMIT 1
            `);
            return result.rows.length > 0;
        } catch (error) {
            console.error('Error accessing the database:', error);
            return null;
        }
    },
};