// _lib/familyrepository.ts
import pool, { QueryExecutor } from '@/_lib/db';

export const familyRepository = {
    async create(data: { name: string }, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<{ id: string; name: string }>(`
            INSERT INTO familys (name)
            VALUES ($1)
            RETURNING id, name
        `,
            [data.name]
        );
        return result.rows[0];
    },

    async assignUser(userId: string, familyId: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        await executor.query(`
            UPDATE users
            SET family_id = $1,
                role = 'MEMBER',
                updated_at = now()
            WHERE id = $2 AND deleted_at IS NULL
        `,
            [familyId, userId]
        );
    },

    async removeUser(userId: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        await executor.query(`
            UPDATE users
            SET family_id = NULL,
                role = 'INDIVIDUAL',
                updated_at = now()
            WHERE id = $1 AND deleted_at IS NULL
        `,
            [userId]
        );
    },

    async findById(id: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<{ id: string; name: string }>(`
            SELECT id, name
            FROM familys
            WHERE id = $1 AND deleted_at IS NULL
        `,
            [id]
        );
        return result.rows[0] ?? null;
    },
};