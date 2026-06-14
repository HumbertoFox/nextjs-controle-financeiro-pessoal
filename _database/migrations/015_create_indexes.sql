-- ============================================================================
-- TABLE: familys
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_familys_deleted_at
    ON familys(deleted_at);

COMMENT ON INDEX idx_familys_deleted_at IS 'Otimiza queries que filtram famílias ativas/deletadas';

-- ============================================================================
-- TABLE: users
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_users_deleted_at
    ON users(deleted_at);

COMMENT ON INDEX idx_users_deleted_at IS 'Otimiza queries que filtram usuários ativos/deletados';

CREATE INDEX IF NOT EXISTS idx_users_family_id
    ON users(family_id);

COMMENT ON INDEX idx_users_family_id IS 'Otimiza queries que buscam usuários por família';

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users(role);

COMMENT ON INDEX idx_users_role IS 'Otimiza queries que filtram usuários por role';

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_one_owner_per_family
    ON users(family_id)
    WHERE is_owner = true AND deleted_at IS NULL;

COMMENT ON INDEX idx_users_one_owner_per_family IS 'Garante unicidade de dono por família — impede dois is_owner = true na mesma família';

-- ============================================================================
-- TABLE: accounts
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_accounts_user_id
    ON accounts(user_id);

COMMENT ON INDEX idx_accounts_user_id IS 'Otimiza queries que buscam contas por usuário';

CREATE INDEX IF NOT EXISTS idx_accounts_family_id
    ON accounts(family_id);

COMMENT ON INDEX idx_accounts_family_id IS 'Otimiza queries que buscam contas por família';

CREATE INDEX IF NOT EXISTS idx_accounts_deleted_at
    ON accounts(deleted_at);

COMMENT ON INDEX idx_accounts_deleted_at IS 'Otimiza queries que filtram contas ativas/deletadas';

-- ============================================================================
-- TABLE: categories
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_categories_user_id
    ON categories(user_id);

COMMENT ON INDEX idx_categories_user_id IS 'Otimiza queries que buscam categorias por usuário';

CREATE INDEX IF NOT EXISTS idx_categories_type
    ON categories(type);

COMMENT ON INDEX idx_categories_type IS 'Otimiza queries que filtram categorias por tipo REVENUE/EXPENSE';

CREATE INDEX IF NOT EXISTS idx_categories_deleted_at
    ON categories(deleted_at);

COMMENT ON INDEX idx_categories_deleted_at IS 'Otimiza queries que filtram categorias ativas/deletadas';

CREATE INDEX IF NOT EXISTS idx_categories_parent_id
    ON categories(parent_id);

COMMENT ON INDEX idx_categories_parent_id IS 'Otimiza queries que buscam subcategorias de uma categoria pai';

-- ============================================================================
-- TABLE: transactions
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_user_id
    ON transactions(user_id);

COMMENT ON INDEX idx_transactions_user_id IS 'Otimiza queries que buscam transações por usuário';

CREATE INDEX IF NOT EXISTS idx_transactions_account_id
    ON transactions(account_id);

COMMENT ON INDEX idx_transactions_account_id IS 'Otimiza queries que buscam transações por conta';

CREATE INDEX IF NOT EXISTS idx_transactions_category_id
    ON transactions(category_id);

COMMENT ON INDEX idx_transactions_category_id IS 'Otimiza queries que buscam transações por categoria';

CREATE INDEX IF NOT EXISTS idx_transactions_transaction_date
    ON transactions(transaction_date);

COMMENT ON INDEX idx_transactions_transaction_date IS 'Otimiza queries que filtram transações por data (extratos, relatórios)';

CREATE INDEX IF NOT EXISTS idx_transactions_status
    ON transactions(status);

COMMENT ON INDEX idx_transactions_status IS 'Otimiza queries que filtram transações por status';

CREATE INDEX IF NOT EXISTS idx_transactions_deleted_at
    ON transactions(deleted_at);

COMMENT ON INDEX idx_transactions_deleted_at IS 'Otimiza queries que filtram transações ativas/deletadas';

-- ============================================================================
-- TABLE: budgets
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_budgets_user_id
    ON budgets(user_id);

COMMENT ON INDEX idx_budgets_user_id IS 'Otimiza queries que buscam orçamentos por usuário';

CREATE INDEX IF NOT EXISTS idx_budgets_category_id
    ON budgets(category_id);

COMMENT ON INDEX idx_budgets_category_id IS 'Otimiza queries que buscam orçamentos por categoria';

CREATE INDEX IF NOT EXISTS idx_budgets_start_date
    ON budgets(start_date);

COMMENT ON INDEX idx_budgets_start_date IS 'Otimiza queries que filtram orçamentos por período';

CREATE INDEX IF NOT EXISTS idx_budgets_deleted_at
    ON budgets(deleted_at);

COMMENT ON INDEX idx_budgets_deleted_at IS 'Otimiza queries que filtram orçamentos ativos/deletados';

-- ============================================================================
-- TABLE: goals
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_goals_user_id
    ON goals(user_id);

COMMENT ON INDEX idx_goals_user_id IS 'Otimiza queries que buscam metas por usuário';

CREATE INDEX IF NOT EXISTS idx_goals_status
    ON goals(status);

COMMENT ON INDEX idx_goals_status IS 'Otimiza queries que filtram metas por status';

CREATE INDEX IF NOT EXISTS idx_goals_deadline
    ON goals(deadline);

COMMENT ON INDEX idx_goals_deadline IS 'Otimiza queries que filtram metas por prazo';

CREATE INDEX IF NOT EXISTS idx_goals_deleted_at
    ON goals(deleted_at);

COMMENT ON INDEX idx_goals_deleted_at IS 'Otimiza queries que filtram metas ativas/deletadas';

-- ============================================================================
-- TABLE: verification_tokens
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at
    ON verification_tokens(expires_at);

COMMENT ON INDEX idx_verification_tokens_expires_at IS 'Otimiza queries de validação e limpeza de tokens expirados';

CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier
    ON verification_tokens(identifier);

COMMENT ON INDEX idx_verification_tokens_identifier IS 'Otimiza busca de tokens por identificador/email';

-- ============================================================================
-- TABLE: rate_limits
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at
    ON rate_limits(reset_at);

COMMENT ON INDEX idx_rate_limits_reset_at IS 'Otimiza limpeza eficiente de entradas expiradas';