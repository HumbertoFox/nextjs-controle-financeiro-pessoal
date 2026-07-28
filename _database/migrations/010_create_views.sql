-- ============================================================================
-- VIEW: users_admin_public
-- Description: Retorna apenas usuários com role ADMIN sem expor dados sensíveis
-- Security: Exclui campo password
-- Use case: Listagem de administradores do sistema
-- ============================================================================
CREATE OR REPLACE VIEW users_admin_public AS
SELECT
    id,
    name,
    email,
    role,
    is_owner,
    avatar,
    email_verified,
    deleted_at,
    created_at,
    updated_at
FROM users
WHERE role = 'ADMIN';

COMMENT ON VIEW users_admin_public IS 'View pública de usuários administradores (exclui password)';

-- ============================================================================
-- VIEW: users_public
-- Description: Todos os usuários sem dados sensíveis (ativos e deletados)
-- Security: Exclui campo password
-- Use case: Listagem geral de usuários para admins
-- ============================================================================
CREATE OR REPLACE VIEW users_public AS
SELECT
    id,
    name,
    email,
    role,
    avatar,
    email_verified,
    deleted_at,
    created_at,
    updated_at
FROM users;

COMMENT ON VIEW users_public IS 'View pública de todos os usuários incluindo deletados (exclui password)';

-- ============================================================================
-- VIEW: users_active
-- Description: Apenas usuários ativos (não deletados) com todos os campos
-- Security: INCLUI password - usar apenas internamente/backend
-- Use case: Autenticação e operações internas que requerem password
-- ============================================================================
CREATE OR REPLACE VIEW users_active WITH (security_barrier = true) AS
SELECT
    u.id,
    u.name,
    u.email,
    u.password,
    u.session_version,
    u.role,
    u.is_owner,
    u.family_id,
    u.avatar,
    u.email_verified,
    u.password_changed_at,
    u.created_at,
    u.updated_at,
    CASE WHEN u.role = 'MEMBER' THEN f.name ELSE NULL END AS family_name
FROM users u
LEFT JOIN familys f ON f.id = u.family_id AND f.deleted_at IS NULL
WHERE u.deleted_at IS NULL;

COMMENT ON VIEW users_active IS 'View de usuários ativos incluindo password e nome da família para MEMBERs (uso interno apenas)';

-- ============================================================================
-- VIEW: users_all
-- Description: Todos os usuários (ativos e deletados) com indicação de deleted_at
-- Security: INCLUI password - usar apenas internamente/backend
-- Use case: Auditoria, administração e relatórios
-- ============================================================================
CREATE OR REPLACE VIEW users_all WITH (security_barrier = true) AS
SELECT
    u.id,
    u.name,
    u.email,
    u.password,
    u.session_version,
    u.role,
    u.is_owner,
    u.family_id,
    u.avatar,
    u.email_verified,
    u.created_at,
    u.updated_at,
    u.deleted_at,
    (u.deleted_at IS NOT NULL) AS is_deleted,
    CASE
        WHEN u.role = 'MEMBER' THEN f.name
        ELSE NULL
    END AS family_name
FROM users u
LEFT JOIN familys f
    ON f.id = u.family_id
    AND f.deleted_at IS NULL;

COMMENT ON VIEW users_all IS
'View de todos os usuários (ativos e deletados), incluindo password, deleted_at e nome da família para MEMBERs.';

-- ============================================================================
-- VIEW: users_public_active
-- Description: Apenas usuários ativos sem dados sensíveis
-- Security: Exclui password e deleted_at
-- Use case: Listagem principal de usuários para interfaces públicas
-- Note: Esta é provavelmente a view mais usada no dia a dia
-- ============================================================================
CREATE OR REPLACE VIEW users_public_active AS
SELECT
    id,
    name,
    email,
    role,
    is_owner,
    avatar,
    email_verified,
    created_at,
    updated_at
FROM users
WHERE deleted_at IS NULL;

COMMENT ON VIEW users_public_active IS 'View pública de usuários ativos (exclui password e deleted_at) - uso principal';

-- ============================================================================
-- VIEW: accounts_active
-- Description: Contas ativas com nome do usuário proprietário
-- Use case: Listagem de contas para dashboards
-- ============================================================================
CREATE OR REPLACE VIEW accounts_active AS
SELECT
    a.id,
    a.user_id,
    a.family_id,
    a.name,
    a.initial_balance,
    a.current_balance,
    a.type,
    a.created_at,
    a.updated_at,
    u.name AS user_name
FROM accounts a
JOIN users u
    ON u.id = a.user_id AND u.deleted_at IS NULL
WHERE a.deleted_at IS NULL;

COMMENT ON VIEW accounts_active IS 'View de contas ativas com nome do usuário proprietário';

-- ============================================================================
-- VIEW: transactions_all
-- Description: Todas as transações (ativas e deletadas) com nome da conta,
--              categoria e informações de parcelamento
-- Use case: Auditoria, administração e relatórios
-- ============================================================================
CREATE OR REPLACE VIEW transactions_all AS
SELECT
    t.id,
    t.user_id,
    t.account_id,
    t.category_id,
    t.type,
    t.value,
    t.description,
    t.transaction_date,
    t.status,
    t.installment_group_id,
    t.installment_number,
    t.installments_total,
    t.created_at,
    t.updated_at,
    t.deleted_at,
    (t.deleted_at IS NOT NULL) AS is_deleted,
    a.name AS account_name,
    c.name AS category_name
FROM transactions t
JOIN accounts a
    ON a.id = t.account_id
JOIN categories c
    ON c.id = t.category_id;

COMMENT ON VIEW transactions_all IS 'View de todas as transações (ativas e deletadas), incluindo informações de parcelamento e indicador de exclusão';

-- ============================================================================
-- VIEW: transactions_detailed
-- Description: Transações ativas com nome da conta e categoria
-- Use case: Extrato financeiro completo
-- ============================================================================
CREATE OR REPLACE VIEW transactions_detailed AS
SELECT
    t.id,
    t.user_id,
    t.account_id,
    t.category_id,
    t.type,
    t.value,
    t.description,
    t.transaction_date,
    t.status,
    t.installment_group_id,
    t.installment_number,
    t.installments_total,
    t.created_at,
    t.updated_at,
    a.name AS account_name,
    c.name AS category_name
FROM transactions t
JOIN accounts a
    ON a.id = t.account_id
JOIN categories c
    ON c.id = t.category_id
WHERE t.deleted_at IS NULL;

COMMENT ON VIEW transactions_detailed IS 'View de transações ativas com nome da conta, categoria e informações de parcelamento';

-- ============================================================================
-- View: view_categories_root_mapping
-- Descrição: Mapeia cada categoria (seja nível 0, subcategoria ou sub-subcategoria)
--            diretamente ao ID e Nome da sua respectiva categoria Raiz (Nível 0).
--            Utilizada para agrupamentos macros e consolidação de gráficos/dashboards.
-- ============================================================================
CREATE OR REPLACE VIEW view_categories_root_mapping AS
SELECT 
    c.id AS category_id,
    COALESCE(gp.id, p.id, c.id) AS root_id,
    COALESCE(gp.name, p.name, c.name) AS root_name,
    c.user_id,
    c.type
FROM categories c
LEFT JOIN categories p
    ON p.id  = c.parent_id AND p.deleted_at IS NULL
LEFT JOIN categories gp
    ON gp.id = p.parent_id AND gp.deleted_at IS NULL
WHERE c.deleted_at IS NULL;

COMMENT ON VIEW view_categories_root_mapping IS 'Mapeia cada categoria (seja nível 0, subcategoria ou sub-subcategoria) diretamente ao ID e Nome da sua respectiva categoria Raiz (Nível 0). Utilizada para agrupamentos macros e consolidação de gráficos/dashboards.';

-- ============================================================================
-- VIEW: budgets_with_spent
-- Description: Orçamentos com total já gasto no período
-- Use case: Dashboard de controle orçamentário
-- ============================================================================
CREATE OR REPLACE VIEW budgets_with_spent AS
SELECT
    b.id,
    b.user_id,
    b.family_id,
    b.category_id,
    c.name AS category_name,
    b.planned_value,
    b.period,
    b.start_date,
    b.end_date,
    COALESCE(SUM(t.value), 0) AS spent_value,
    b.planned_value - COALESCE(SUM(t.value), 0) AS remaining_value
FROM budgets b
JOIN categories  c ON c.id = b.category_id
LEFT JOIN transactions t
    ON  t.category_id = b.category_id
    AND t.user_id     = b.user_id
    AND t.type        = 'EXPENSE'
    AND t.status      = 'CONFIRMED'
    AND t.deleted_at  IS NULL
    AND t.transaction_date BETWEEN b.start_date AND COALESCE(b.end_date, CURRENT_DATE)
WHERE b.deleted_at IS NULL
GROUP BY b.id, c.name;

COMMENT ON VIEW budgets_with_spent IS 'View de orçamentos com total gasto e valor restante no período';