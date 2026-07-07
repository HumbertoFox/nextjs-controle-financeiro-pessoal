-- Garante que estamos operando como o owner das tabelas
SET ROLE NONE;

-- ============================================================
-- 1. Revogar GRANTs e memberships da role no banco atual
-- ============================================================
DO $$ DECLARE
    member RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '__ROLE_NAME__') THEN
        FOR member IN
            SELECT m.rolname
            FROM pg_roles m
            JOIN pg_auth_members am ON am.member = m.oid
            JOIN pg_roles r         ON r.oid     = am.roleid
            WHERE r.rolname = '__ROLE_NAME__'
        LOOP
            EXECUTE format('REVOKE __ROLE_NAME__ FROM %I', member.rolname);
        END LOOP;

        REVOKE ALL ON SCHEMA public FROM __ROLE_NAME__;

        -- Tables
        REVOKE ALL ON TABLE users               FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE familys             FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE accounts            FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE categories          FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE transactions        FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE budgets             FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE goals               FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE verification_tokens FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE rate_limits         FROM __ROLE_NAME__;

        -- Views
        REVOKE ALL ON TABLE users_active                 FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE users_public                 FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE users_public_active          FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE users_admin_public           FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE accounts_active              FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE transactions_all             FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE transactions_detailed        FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE budgets_with_spent           FROM __ROLE_NAME__;
        REVOKE ALL ON TABLE view_categories_root_mapping FROM __ROLE_NAME__;

        REASSIGN OWNED BY __ROLE_NAME__ TO CURRENT_USER;
        DROP OWNED BY __ROLE_NAME__;
    END IF;
END $$;

-- ============================================================
-- 2. Policies RLS
-- ============================================================
DROP POLICY IF EXISTS policy_users_backend               ON users;
DROP POLICY IF EXISTS policy_users_public                ON users;
DROP POLICY IF EXISTS policy_familys_backend             ON familys;
DROP POLICY IF EXISTS policy_accounts_backend            ON accounts;
DROP POLICY IF EXISTS policy_categories_backend          ON categories;
DROP POLICY IF EXISTS policy_transactions_backend        ON transactions;
DROP POLICY IF EXISTS policy_budgets_backend             ON budgets;
DROP POLICY IF EXISTS policy_goals_backend               ON goals;
DROP POLICY IF EXISTS policy_verification_tokens_backend ON verification_tokens;
DROP POLICY IF EXISTS policy_rate_limits_backend         ON rate_limits;
DROP POLICY IF EXISTS policy_rate_limits_public          ON rate_limits;

-- ============================================================
-- 3. Triggers e function
-- ============================================================
DROP TRIGGER IF EXISTS trigger_update_users_updated_at        ON users;
DROP TRIGGER IF EXISTS trigger_update_familys_updated_at      ON familys;
DROP TRIGGER IF EXISTS trigger_update_accounts_updated_at     ON accounts;
DROP TRIGGER IF EXISTS trigger_update_categories_updated_at   ON categories;
DROP TRIGGER IF EXISTS trigger_update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS trigger_update_budgets_updated_at      ON budgets;
DROP TRIGGER IF EXISTS trigger_update_goals_updated_at        ON goals;
DROP FUNCTION IF EXISTS update_updated_at;

-- ============================================================
-- 4. Views
-- ============================================================
DROP VIEW IF EXISTS view_categories_root_mapping CASCADE;
DROP VIEW IF EXISTS budgets_with_spent           CASCADE;
DROP VIEW IF EXISTS transactions_all             CASCADE;
DROP VIEW IF EXISTS transactions_detailed        CASCADE;
DROP VIEW IF EXISTS accounts_active              CASCADE;
DROP VIEW IF EXISTS users_public_active          CASCADE;
DROP VIEW IF EXISTS users_active                 CASCADE;
DROP VIEW IF EXISTS users_all                    CASCADE;
DROP VIEW IF EXISTS users_public                 CASCADE;
DROP VIEW IF EXISTS users_admin_public           CASCADE;

-- ============================================================
-- 5. Tables (ordem respeita FKs)
-- ============================================================
DROP TABLE IF EXISTS goals               CASCADE;
DROP TABLE IF EXISTS budgets             CASCADE;
DROP TABLE IF EXISTS transactions        CASCADE;
DROP TABLE IF EXISTS categories          CASCADE;
DROP TABLE IF EXISTS accounts            CASCADE;
DROP TABLE IF EXISTS rate_limits         CASCADE;
DROP TABLE IF EXISTS verification_tokens CASCADE;
DROP TABLE IF EXISTS users               CASCADE;
DROP TABLE IF EXISTS familys             CASCADE;

-- ============================================================
-- 6. ENUMs
-- ============================================================
DROP TYPE IF EXISTS goal_status        CASCADE;
DROP TYPE IF EXISTS budget_period      CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS transaction_type   CASCADE;
DROP TYPE IF EXISTS account_type       CASCADE;
DROP TYPE IF EXISTS user_role          CASCADE;

-- ============================================================
-- 7. Tabela de migrations
-- ============================================================
DROP TABLE IF EXISTS schema_migrations CASCADE;

-- ============================================================
-- 8. Extensões
-- ============================================================
DROP EXTENSION IF EXISTS pgcrypto CASCADE;
DROP EXTENSION IF EXISTS citext   CASCADE;

-- NOTA: DROP ROLE não é feito aqui.
-- A role é global no cluster PostgreSQL e pode ter objetos em outros bancos.
-- O reset.ts cuida do DROP ROLE após limpar todos os bancos afetados.