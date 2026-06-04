-- ============================================================================
-- TABLE: transactions
-- Description: Armazena as transações financeiras dos usuários
-- Features:
--   - Soft delete habilitado via deleted_at
--   - Suporte a múltiplos status via transaction_status
--   - Valor sempre positivo, tipo definido pela categoria
--   - Timestamps automáticos de auditoria
-- ============================================================================
CREATE TABLE IF NOT EXISTS transactions (
    id               UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id       UUID               NOT NULL,                        -- Conta associada
    category_id      UUID               NOT NULL,                        -- Categoria associada
    user_id          UUID               NOT NULL,                        -- Usuário proprietário
    type             transaction_type   NOT NULL,                        -- REVENUE ou EXPENSE
    value            NUMERIC(12,2)      NOT NULL CHECK (value >= 0),     -- Valor da transação
    description      TEXT               NULL,                            -- Descrição opcional
    transaction_date DATE               NOT NULL,                        -- Data da transação
    status           transaction_status NOT NULL DEFAULT 'CONFIRMED',    -- Status da transação
    deleted_at       TIMESTAMPTZ        NULL,                            -- Soft delete timestamp
    created_at       TIMESTAMPTZ        NOT NULL DEFAULT now(),          -- Data de criação do registro
    updated_at       TIMESTAMPTZ        NOT NULL DEFAULT now(),          -- Data da última atualização

    CONSTRAINT fk_transactions_account
        FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_transactions_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================
COMMENT ON TABLE transactions IS 'Tabela de transações financeiras com suporte a soft delete e controle de status';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN transactions.id               IS 'Identificador único da transação (UUID v4)';
COMMENT ON COLUMN transactions.account_id       IS 'Conta associada à transação';
COMMENT ON COLUMN transactions.category_id      IS 'Categoria associada à transação';
COMMENT ON COLUMN transactions.user_id          IS 'Usuário proprietário da transação';
COMMENT ON COLUMN transactions.type             IS 'Tipo da transação: REVENUE (receita) ou EXPENSE (despesa)';
COMMENT ON COLUMN transactions.value            IS 'Valor da transação (sempre positivo, tipo definido pela categoria)';
COMMENT ON COLUMN transactions.description      IS 'Descrição opcional da transação';
COMMENT ON COLUMN transactions.transaction_date IS 'Data em que a transação ocorreu';
COMMENT ON COLUMN transactions.status           IS 'Status da transação: PENDING, CONFIRMED ou CANCELLED';
COMMENT ON COLUMN transactions.deleted_at       IS 'Timestamp de soft delete (NULL = ativo, NOT NULL = deletado)';
COMMENT ON COLUMN transactions.created_at       IS 'Data e hora de criação do registro';
COMMENT ON COLUMN transactions.updated_at       IS 'Data e hora da última atualização (atualizado automaticamente)';