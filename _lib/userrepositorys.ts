import pool, { QueryExecutor } from '@/_lib/db';
import { AccountType, User, UserActive, UserAdminPublic, UserDetailsProps, UserPublic, UserRole, UsersPagination } from '@/_types';

const ALLOWED_UPDATE_COLUMNS_USER: ReadonlySet<string> = new Set(['name', 'email', 'avatar']);

const ALLOWED_UPDATE_COLUMNS_ADMIN: ReadonlySet<string> = new Set(['name', 'email', 'role', 'password', 'avatar']);

function buildSetClause(data: Record<string, unknown>, allowed: ReadonlySet<string>): {
    setClause: string;
    values: unknown[];
} {
    const keys = Object.keys(data).filter(k => allowed.has(k));
    if (!keys.length) throw new Error('No valid fields to update.');
    const values = keys.map(k => data[k]);
    const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
    return { setClause, values };
}

const USER_COMMON_COLUMNS = ` id, name, email, role, is_owner, avatar, email_verified, deleted_at, created_at, updated_at `;
const USER_PUBLIC_ACTIVE_COLUMNS = ` id, name, email, role, is_owner, avatar, email_verified, created_at, updated_at `;
const USER_ACTIVE_COLUMNS = ` id, name, email, role, is_owner, avatar, family_id, family_name, email_verified, created_at, updated_at `;

export const userRepository = {
    // -------------------------------------------------------------------------
    // Busca na view pública por ID (sem password)
    // -------------------------------------------------------------------------
    async findPublicById(id: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query(`
            SELECT *
            FROM users_public
            WHERE id = $1
            LIMIT 1
        `,
            [id]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Busca usuário ativo por ID (inclui password — uso interno)
    // -------------------------------------------------------------------------
    async findActiveById(id: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<UserActive>(`
            SELECT *
            FROM users_active
            WHERE id = $1
            LIMIT 1
        `,
            [id]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Busca usuário ativo por email (inclui password — uso interno/autenticação)
    // -------------------------------------------------------------------------
    async findByEmailActive(email: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<User>(`
            SELECT *
            FROM users_active
            WHERE email = $1
            LIMIT 1
        `,
            [email]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Busca usuário ativo por email na view pública (sem password)
    // -------------------------------------------------------------------------
    async findByEmail(email: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<UserPublic>(`
            SELECT ${USER_PUBLIC_ACTIVE_COLUMNS}
            FROM users_public_active
            WHERE email = $1
            LIMIT 1
        `,
            [email]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Busca membros ativos de uma família
    // -------------------------------------------------------------------------
    async findByFamilyId(familyId: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<UserDetailsProps>(`
            SELECT ${USER_ACTIVE_COLUMNS}
            FROM users_active
            WHERE family_id = $1
        `,
            [familyId]
        );
        return result.rows;
    },

    // -------------------------------------------------------------------------
    // Verifica se existe ao menos um ADMIN ativo no sistema
    // -------------------------------------------------------------------------
    async adminExists(client?: QueryExecutor): Promise<boolean> {
        const executor = client ?? pool;
        const result = await executor.query<{ exists: boolean }>(`
            SELECT EXISTS (
                SELECT 1
                FROM users_admin_public
                WHERE deleted_at IS NULL
            ) AS exists
        `);
        return result.rows[0].exists ?? false;
    },

    // -------------------------------------------------------------------------
    // Retorna o primeiro ADMIN (apenas id)
    // -------------------------------------------------------------------------
    async findAdminOnly(client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query(`
            SELECT id
            FROM users_admin_public
            LIMIT 1
        `);
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Retorna todos os ADMINs
    // -------------------------------------------------------------------------
    async findAllAdmins(client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<UserAdminPublic>(`
            SELECT *
            FROM users_admin_public
        `);
        return result.rows;
    },

    // -------------------------------------------------------------------------
    // Contagem de ADMINs ativos
    // -------------------------------------------------------------------------
    async countActiveAdmins(client?: QueryExecutor): Promise<number> {
        const executor = client ?? pool;
        const result = await executor.query<{ count: string }>(`
            SELECT COUNT(*)
            FROM users_admin_public
            WHERE deleted_at IS NULL
        `);
        return Number(result.rows[0].count);
    },

    // -------------------------------------------------------------------------
    // Busca por ID na view pública
    // -------------------------------------------------------------------------
    async findById(id: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<UserPublic>(`
            SELECT *
            FROM users_public
            WHERE id = $1
            LIMIT 1
        `,
            [id]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Busca paginada de usuários não administradores
    // -------------------------------------------------------------------------
    async findUsersPaginated(page: number, pageSize: number, client?: QueryExecutor) {
        const executor = client ?? pool;
        const offset = (page - 1) * pageSize;

        const usersResult = await executor.query<UsersPagination>(`
            SELECT
                u.id,
                u.name,
                u.email,
                u.family_name,
                u.deleted_at,
                CASE
                    WHEN u.family_id IS NOT NULL THEN (
                        SELECT COUNT(*)
                        FROM users u2
                        WHERE u2.family_id = u.family_id
                          AND u2.deleted_at IS NULL
                    )
                    ELSE NULL
                END AS family_member_count
            FROM users_all u
            WHERE u.role IN ('INDIVIDUAL', 'MEMBER')
            ORDER BY u.created_at
            LIMIT $1
            OFFSET $2
        `,
            [pageSize, offset]
        );

        const countResult = await executor.query<{ count: string }>(`
            SELECT COUNT(*)
            FROM users_all
            WHERE role IN ('INDIVIDUAL', 'MEMBER')
        `);

        return [
            usersResult.rows,
            parseInt(countResult.rows[0].count, 10),
        ] as const;
    },

    // -------------------------------------------------------------------------
    // Busca session_version para validação de sessão
    // -------------------------------------------------------------------------
    async findSessionVersion(id: string, client?: QueryExecutor): Promise<{ session_version: number } | null> {
        const executor = client ?? pool;
        const result = await executor.query<{ session_version: number }>(`
            SELECT session_version
            FROM users_active
            WHERE id = $1
        `,
            [id]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Criação de usuário
    // -------------------------------------------------------------------------
    async create(data: {
        name: string;
        email: string;
        password: string;
        role: UserRole;
        avatar?: string | null;
    }, client?: QueryExecutor): Promise<{ id: string; role: UserRole }> {
        const executor = client ?? pool;
        const result = await executor.query<{ id: string; role: UserRole }>(`
            INSERT INTO users ( name, email, password, role, avatar )
            VALUES ( $1, $2, $3, $4, $5 )
            RETURNING id, role
        `,
            [data.name, data.email, data.password, data.role, data.avatar ?? null,]
        );
        return result.rows[0];
    },

    // -------------------------------------------------------------------------
    // Atualização de avatar
    // -------------------------------------------------------------------------
    async updateAvatar(id: string, avatar: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        await executor.query(`
            UPDATE users
            SET avatar = $1
            WHERE id = $2
        `,
            [avatar, id]
        );
    },

    // -------------------------------------------------------------------------
    // Atualização pelo próprio usuário ativo (campos permitidos: name, email, avatar)
    // -------------------------------------------------------------------------
    async updateByIdUserActive(id: string, data: Partial<Pick<User, 'name' | 'email' | 'role' | 'avatar'>>, client?: QueryExecutor) {
        if (!Object.keys(data).length) return null;
        if (data.role && data.role === 'ADMIN') return null;
        const executor = client ?? pool;
        const { setClause, values } = buildSetClause(
            data as Record<string, unknown>,
            ALLOWED_UPDATE_COLUMNS_USER
        );
        const result = await executor.query<User>(`
            UPDATE users
            SET ${setClause}
            WHERE id = $1
            AND deleted_at IS NULL
            RETURNING ${USER_COMMON_COLUMNS}
        `,
            [id, ...values]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Atualização por admin
    // -------------------------------------------------------------------------
    async updateByAdminUser(id: string, data: Partial<Pick<User, 'name' | 'email' | 'role' | 'password' | 'avatar'>>, client?: QueryExecutor) {
        const executor = client ?? pool;
        const { setClause, values } = buildSetClause(data as Record<string, unknown>, ALLOWED_UPDATE_COLUMNS_ADMIN);
        const result = await executor.query<User>(`
            UPDATE users
            SET ${setClause}
            WHERE id = $1
            RETURNING ${USER_COMMON_COLUMNS}
        `,
            [id, ...values]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Atualização de senha por ID
    // -------------------------------------------------------------------------
    async updatePassword(id: string, password: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<User>(`
            UPDATE users
            SET password = $1
            WHERE id = $2
            RETURNING ${USER_COMMON_COLUMNS}
        `,
            [password, id]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Soft delete
    // -------------------------------------------------------------------------
    async softDeleteById(id: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<User>(`
            UPDATE users
            SET deleted_at = NOW()
            WHERE id = $1
            RETURNING ${USER_COMMON_COLUMNS}
        `,
            [id]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Reativação (desfaz soft delete)
    // -------------------------------------------------------------------------
    async reactivateById(id: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<User>(`
            UPDATE users
            SET deleted_at = NULL
            WHERE id = $1
            RETURNING ${USER_COMMON_COLUMNS}
        `,
            [id]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Atualização do timestamp de verificação de email
    // -------------------------------------------------------------------------
    async updateEmailVerified(id: string, date: Date, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query<User>(`
            UPDATE users
            SET email_verified = $1
            WHERE id = $2
            RETURNING ${USER_COMMON_COLUMNS}
        `,
            [date, id]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Atualização de senha por email (reset de senha)
    // -------------------------------------------------------------------------
    async updatePasswordByEmail(email: string, hashedPassword: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        const result = await executor.query(`
            UPDATE users
            SET password = $2
            WHERE email = $1
            RETURNING ${USER_COMMON_COLUMNS}
        `,
            [email, hashedPassword]
        );
        return result.rows[0] ?? null;
    },

    // -------------------------------------------------------------------------
    // Incrementa session_version e retorna o novo valor
    // -------------------------------------------------------------------------
    async incrementSessionVersion(id: string, client?: QueryExecutor): Promise<number> {
        const executor = client ?? pool;
        const result = await executor.query<{ session_version: number }>(`
            UPDATE users
            SET session_version = session_version + 1,
                updated_at = now()
            WHERE id = $1 AND deleted_at IS NULL
            RETURNING session_version
        `,
            [id]
        );
        return result.rows[0].session_version;
    },

    // -------------------------------------------------------------------------
    // Remove usuário da família e reverte role para INDIVIDUAL
    // -------------------------------------------------------------------------
    async removeFromFamily(id: string, client?: QueryExecutor) {
        const executor = client ?? pool;
        await executor.query(`
            UPDATE users
            SET family_id = NULL,
                role = 'INDIVIDUAL',
                is_owner = false,
                updated_at = now()
            WHERE id = $1 AND deleted_at IS NULL
        `,
            [id]
        );
    },

    // -------------------------------------------------------------------------
    // Busca contas ativas do usuário para a página de perfil
    // -------------------------------------------------------------------------
    async getUserPageData(userId: string, client?: QueryExecutor): Promise<{
        accounts: {
            id: string;
            name: string;
            type: AccountType;
            current_balance: string
        }[];
    }> {
        const executor = client ?? pool;

        const result = await executor.query<{
            id: string;
            name: string;
            type: AccountType;
            current_balance: string;
        }>(`
            SELECT id, name, type, current_balance::text
            FROM accounts
            WHERE user_id = $1
              AND deleted_at IS NULL
            ORDER BY created_at ASC
        `,
            [userId]
        );

        return { accounts: result.rows };
    },
}