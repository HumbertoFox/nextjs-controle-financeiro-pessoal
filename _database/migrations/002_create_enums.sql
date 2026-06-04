-- ============================================================================
-- ENUM: user_role
-- Description: Define os níveis de acesso do usuário no sistema
-- Values:
--   - ADMIN: Acesso administrativo completo
--   - INDIVIDUAL: Acesso padrão de usuário
--   - MEMBER: Acesso de usuário membro da família
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'user_role'
    ) THEN
        CREATE TYPE user_role AS ENUM (
            'ADMIN',
            'INDIVIDUAL',
            'MEMBER'
        );
    END IF;
END$$;

-- ============================================================================
-- ENUM: account_type
-- Description: Define os tipos de conta financeira no sistema
-- Values:
--   - CURRENT:     Conta corrente
--   - SAVINGS:     Conta poupança
--   - CREDIT:      Cartão de crédito
--   - INVESTMENT:  Conta de investimento
--   - DIGITAL:     Conta digital
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'account_type'
    ) THEN
        CREATE TYPE account_type AS ENUM (
            'CURRENT',
            'SAVINGS',
            'CREDIT',
            'INVESTMENT',
            'DIGITAL'
        );
    END IF;
END$$;

-- ============================================================================
-- ENUM: transaction_type
-- Description: Define o tipo de fluxo financeiro
-- Values:
--   - REVENUE: Receita (entrada de valor)
--   - EXPENSE: Despesa (saída de valor)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'transaction_type'
    ) THEN
        CREATE TYPE transaction_type AS ENUM (
            'REVENUE',
            'EXPENSE'
        );
    END IF;
END$$;

-- ============================================================================
-- ENUM: transaction_status
-- Description: Define os status de uma transação
-- Values:
--   - PENDING:   Transação pendente
--   - CONFIRMED: Transação confirmada
--   - CANCELLED: Transação cancelada
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'transaction_status'
    ) THEN
        CREATE TYPE transaction_status AS ENUM (
            'PENDING',
            'CONFIRMED',
            'CANCELLED'
        );
    END IF;
END$$;

-- ============================================================================
-- ENUM: budget_period
-- Description: Define o período de um orçamento
-- Values:
--   - MONTHLY: Orçamento mensal
--   - YEARLY:  Orçamento anual
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'budget_period'
    ) THEN
        CREATE TYPE budget_period AS ENUM (
            'MONTHLY',
            'YEARLY'
        );
    END IF;
END$$;

-- ============================================================================
-- ENUM: goal_status
-- Description: Define o status de uma meta financeira
-- Values:
--   - IN_PROGRESS: Meta em andamento
--   - COMPLETED:   Meta concluída
--   - CANCELLED:   Meta cancelada
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'goal_status'
    ) THEN
        CREATE TYPE goal_status AS ENUM (
            'IN_PROGRESS',
            'COMPLETED',
            'CANCELLED'
        );
    END IF;
END$$;