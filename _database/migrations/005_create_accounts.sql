-- ============================================================================
-- TABLE: accounts
-- Description: Armazena as contas financeiras dos usuários
-- Features:
--   - Soft delete habilitado via deleted_at
--   - Suporte a múltiplos tipos de conta via account_type
--   - Timestamps automáticos de auditoria
-- ============================================================================
CREATE TABLE IF NOT EXISTS accounts (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID          NOT NULL,                          -- Usuário proprietário da conta
    family_id       UUID          NULL,                              -- Família associada (opcional)
    name            TEXT          NOT NULL,                          -- Nome da conta
    initial_balance NUMERIC(12,2) NOT NULL DEFAULT 0,                -- Saldo inicial
    current_balance NUMERIC(12,2) NOT NULL DEFAULT 0,                -- Saldo atual
    type            account_type  NOT NULL,                          -- Tipo da conta
    deleted_at      TIMESTAMPTZ   NULL,                              -- Soft delete timestamp
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),            -- Data de criação do registro
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT now(),            -- Data da última atualização

    CONSTRAINT fk_accounts_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_accounts_family
        FOREIGN KEY (family_id)
        REFERENCES familys(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================
COMMENT ON TABLE accounts IS 'Tabela de contas financeiras dos usuários com suporte a soft delete e múltiplos tipos de conta';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN accounts.id              IS 'Identificador único da conta (UUID v4)';
COMMENT ON COLUMN accounts.user_id         IS 'Usuário proprietário da conta';
COMMENT ON COLUMN accounts.family_id       IS 'Família associada (opcional)';
COMMENT ON COLUMN accounts.name            IS 'Nome da conta';
COMMENT ON COLUMN accounts.initial_balance IS 'Saldo inicial da conta no momento da criação';
COMMENT ON COLUMN accounts.current_balance IS 'Saldo atual da conta (atualizado a cada transação)';
COMMENT ON COLUMN accounts.type            IS 'Tipo da conta: CURRENT, SAVINGS, CREDIT, INVESTMENT ou DIGITAL';
COMMENT ON COLUMN accounts.deleted_at      IS 'Timestamp de soft delete (NULL = ativo, NOT NULL = deletado)';
COMMENT ON COLUMN accounts.created_at      IS 'Data e hora de criação do registro';
COMMENT ON COLUMN accounts.updated_at      IS 'Data e hora da última atualização (atualizado automaticamente)';