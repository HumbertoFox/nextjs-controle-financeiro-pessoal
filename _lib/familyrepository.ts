import pool, { QueryExecutor } from '@/_lib/db';

export const familyRepository = {
    // -------------------------------------------------------------------------
    // Cria uma nova família e vincula o criador como dono
    // -------------------------------------------------------------------------
    async create(data: { name: string; ownerId: string }, client?: QueryExecutor) {
        const executor = client ?? pool;

        const result = await executor.query<{ id: string; name: string }>(`
            INSERT INTO familys (name)
            VALUES ($1)
            RETURNING id, name
        `,
            [data.name]
        );

        const family = result.rows[0];

        await executor.query(`
            UPDATE users
            SET family_id = $1,
                role = 'MEMBER',
                is_owner = true,
                updated_at = now()
            WHERE id = $2 AND deleted_at IS NULL
        `,
            [family.id, data.ownerId]
        );

        return family;
    },

    // -------------------------------------------------------------------------
    // Vincula usuário a uma família como membro comum (via convite)
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // Busca família ativa por ID
    // -------------------------------------------------------------------------
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

    // -------------------------------------------------------------------------
    // Verifica se o usuário é o dono da família
    // -------------------------------------------------------------------------
    async isOwner(familyId: string, userId: string, client?: QueryExecutor): Promise<boolean> {
        const executor = client ?? pool;
        const result = await executor.query<{ exists: boolean }>(`
            SELECT EXISTS (
                SELECT 1
                FROM users
                WHERE id = $1
                  AND family_id = $2
                  AND is_owner = true
                  AND deleted_at IS NULL
            ) AS exists
        `,
            [userId, familyId]
        );
        return result.rows[0].exists ?? false;
    },
};