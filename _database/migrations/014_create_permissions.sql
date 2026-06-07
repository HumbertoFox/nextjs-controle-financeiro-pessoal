-- ============================================================================
-- ROLES
-- ============================================================================
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '__ROLE_NAME__') THEN
        CREATE ROLE __ROLE_NAME__ NOLOGIN;
    END IF;
END $$;

DO $$
DECLARE
    current_user_name TEXT := current_user;
BEGIN
    EXECUTE format('GRANT __ROLE_NAME__ TO %I', current_user_name);
EXCEPTION WHEN others THEN
    RAISE NOTICE 'GRANT __ROLE_NAME__ TO % skipped: %', current_user_name, SQLERRM;
END $$;

-- ============================================================================
-- GRANT: acesso ao schema public
-- ============================================================================
GRANT USAGE ON SCHEMA public TO __ROLE_NAME__;

-- ============================================================================
-- REVOKE: bloqueia acesso direto a todas as tabelas para PUBLIC
-- ============================================================================
REVOKE ALL ON users               FROM PUBLIC;
REVOKE ALL ON users_active        FROM PUBLIC;
REVOKE ALL ON users_all           FROM PUBLIC;
REVOKE ALL ON familys             FROM PUBLIC;
REVOKE ALL ON accounts            FROM PUBLIC;
REVOKE ALL ON categories          FROM PUBLIC;
REVOKE ALL ON transactions        FROM PUBLIC;
REVOKE ALL ON budgets             FROM PUBLIC;
REVOKE ALL ON goals               FROM PUBLIC;
REVOKE ALL ON verification_tokens FROM PUBLIC;
REVOKE ALL ON rate_limits         FROM PUBLIC;

-- ============================================================================
-- GRANT views públicas → PUBLIC (sem password)
-- ============================================================================
GRANT SELECT ON users_public        TO PUBLIC;
GRANT SELECT ON users_admin_public  TO PUBLIC;
GRANT SELECT ON users_public_active TO PUBLIC;

-- ============================================================================
-- GRANT todas as tabelas → somente backend
-- ============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON users               TO __ROLE_NAME__;
GRANT SELECT, INSERT, UPDATE, DELETE ON familys             TO __ROLE_NAME__;
GRANT SELECT, INSERT, UPDATE, DELETE ON accounts            TO __ROLE_NAME__;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories          TO __ROLE_NAME__;
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions        TO __ROLE_NAME__;
GRANT SELECT, INSERT, UPDATE, DELETE ON budgets             TO __ROLE_NAME__;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals               TO __ROLE_NAME__;
GRANT SELECT, INSERT, UPDATE, DELETE ON verification_tokens TO __ROLE_NAME__;
GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limits         TO __ROLE_NAME__;

-- ============================================================================
-- GRANT views com dados sensíveis → somente backend
-- ============================================================================
GRANT SELECT ON users_active            TO __ROLE_NAME__;
GRANT SELECT ON accounts_active         TO __ROLE_NAME__;
GRANT SELECT ON users_all               TO __ROLE_NAME__;
GRANT SELECT ON transactions_detailed   TO __ROLE_NAME__;
GRANT SELECT ON budgets_with_spent      TO __ROLE_NAME__;

-- ============================================================================
-- RLS: users
-- ============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'users' AND policyname = 'policy_users_backend'
    ) THEN
        CREATE POLICY policy_users_backend
            ON users FOR ALL TO __ROLE_NAME__ USING (true);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'users' AND policyname = 'policy_users_public'
    ) THEN
        CREATE POLICY policy_users_public
            ON users FOR SELECT TO PUBLIC USING (false);
    END IF;
END $$;

-- ============================================================================
-- RLS: familys
-- ============================================================================
ALTER TABLE familys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'familys' AND policyname = 'policy_familys_backend'
    ) THEN
        CREATE POLICY policy_familys_backend
            ON familys FOR ALL TO __ROLE_NAME__ USING (true);
    END IF;
END $$;

-- ============================================================================
-- RLS: accounts
-- ============================================================================
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'accounts' AND policyname = 'policy_accounts_backend'
    ) THEN
        CREATE POLICY policy_accounts_backend
            ON accounts FOR ALL TO __ROLE_NAME__ USING (true);
    END IF;
END $$;

-- ============================================================================
-- RLS: categories
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'categories' AND policyname = 'policy_categories_backend'
    ) THEN
        CREATE POLICY policy_categories_backend
            ON categories FOR ALL TO __ROLE_NAME__ USING (true);
    END IF;
END $$;

-- ============================================================================
-- RLS: transactions
-- ============================================================================
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'transactions' AND policyname = 'policy_transactions_backend'
    ) THEN
        CREATE POLICY policy_transactions_backend
            ON transactions FOR ALL TO __ROLE_NAME__ USING (true);
    END IF;
END $$;

-- ============================================================================
-- RLS: budgets
-- ============================================================================
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'budgets' AND policyname = 'policy_budgets_backend'
    ) THEN
        CREATE POLICY policy_budgets_backend
            ON budgets FOR ALL TO __ROLE_NAME__ USING (true);
    END IF;
END $$;

-- ============================================================================
-- RLS: goals
-- ============================================================================
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'goals' AND policyname = 'policy_goals_backend'
    ) THEN
        CREATE POLICY policy_goals_backend
            ON goals FOR ALL TO __ROLE_NAME__ USING (true);
    END IF;
END $$;

-- ============================================================================
-- RLS: verification_tokens
-- ============================================================================
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'verification_tokens' AND policyname = 'policy_verification_tokens_backend'
    ) THEN
        CREATE POLICY policy_verification_tokens_backend
            ON verification_tokens FOR ALL TO __ROLE_NAME__ USING (true);
    END IF;
END $$;

-- ============================================================================
-- RLS: rate_limits
-- ============================================================================
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'rate_limits' AND policyname = 'policy_rate_limits_backend'
    ) THEN
        CREATE POLICY policy_rate_limits_backend
            ON rate_limits FOR ALL TO __ROLE_NAME__ USING (true);
    END IF;
END $$;