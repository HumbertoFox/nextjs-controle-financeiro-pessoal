import pool, { QueryExecutor } from '@/_lib/db';
import { CategoryFlat } from '@/_types';

export const categoryRepository = {
    // -------------------------------------------------------------------------
    // Busca toda a árvore de categorias do usuário via CTE recursiva (até 3 níveis)
    // -------------------------------------------------------------------------
    async findTreeByUserId(userId: string, client?: QueryExecutor): Promise<CategoryFlat[]> {
        const executor = client ?? pool;
        const result = await executor.query<CategoryFlat>(`
            WITH RECURSIVE cat_tree AS (
                SELECT
                    id,
                    name,
                    type,
                    parent_id,
                    0 AS depth
                FROM categories
                WHERE user_id = $1
                  AND parent_id IS NULL
                  AND deleted_at IS NULL

                UNION ALL

                SELECT
                    c.id,
                    c.name,
                    c.type,
                    c.parent_id,
                    ct.depth + 1
                FROM categories c
                INNER JOIN cat_tree ct ON ct.id = c.parent_id
                WHERE c.deleted_at IS NULL
                  AND ct.depth < 2
            )
            SELECT
                ct.id,
                ct.name,
                ct.type,
                ct.parent_id,
                p.name AS parent_name,
                ct.depth
            FROM cat_tree ct
            LEFT JOIN categories p ON p.id = ct.parent_id
            ORDER BY ct.depth, ct.name
        `,
            [userId]
        );
        return result.rows;
    },

    // -------------------------------------------------------------------------
    // Busca apenas categorias raiz (nível 0) do usuário
    // -------------------------------------------------------------------------
    async findRootsByUserId(userId: string, client?: QueryExecutor): Promise<CategoryFlat[]> {
        const executor = client ?? pool;
        const result = await executor.query<CategoryFlat>(`
            SELECT id, name, type, parent_id, NULL AS parent_name, 0 AS depth
            FROM categories
            WHERE user_id = $1
              AND parent_id IS NULL
              AND deleted_at IS NULL
            ORDER BY name
        `,
            [userId]
        );
        return result.rows;
    },

    // -------------------------------------------------------------------------
    // Busca filhos diretos de uma categoria
    // -------------------------------------------------------------------------
    async findChildrenById(parentId: string, client?: QueryExecutor): Promise<CategoryFlat[]> {
        const executor = client ?? pool;
        const result = await executor.query<CategoryFlat>(`
            SELECT
                c.id,
                c.name,
                c.type,
                c.parent_id,
                p.name AS parent_name,
                1 AS depth
            FROM categories c
            LEFT JOIN categories p ON p.id = c.parent_id
            WHERE c.parent_id = $1
              AND c.deleted_at IS NULL
            ORDER BY c.name
        `,
            [parentId]
        );
        return result.rows;
    },

    // -------------------------------------------------------------------------
    // Cria categoria (raiz ou filha)
    // -------------------------------------------------------------------------
    async create(data: {
        userId: string;
        familyId?: string | null;
        name: string;
        type: 'REVENUE' | 'EXPENSE';
        parentId?: string | null;
    }, client?: QueryExecutor): Promise<{ id: string; name: string }> {
        const executor = client ?? pool;
        const result = await executor.query<{ id: string; name: string }>(`
            INSERT INTO categories (user_id, family_id, name, type, parent_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name
        `,
            [data.userId, data.familyId ?? null, data.name, data.type, data.parentId ?? null]
        );
        return result.rows[0];
    },

    // -------------------------------------------------------------------------
    // Soft delete de categoria (falha se tiver filhos ativos)
    // -------------------------------------------------------------------------
    async softDeleteById(id: string, client?: QueryExecutor): Promise<boolean> {
        const executor = client ?? pool;

        const hasChildren = await executor.query<{ exists: boolean }>(`
            SELECT EXISTS (
                SELECT 1 FROM categories
                WHERE parent_id = $1 AND deleted_at IS NULL
            ) AS exists
        `,
            [id]
        );
        if (hasChildren.rows[0].exists) return false;

        await executor.query(`
            UPDATE categories
            SET deleted_at = now()
            WHERE id = $1
        `,
            [id]
        );
        return true;
    },
};