-- ============================================================================
-- TABLE: categories
-- Description: Armazena as categorias de transações dos usuários
-- Features:
--   - Soft delete habilitado via deleted_at
--   - Suporte a categorias de receita e despesa via category_type
--   - Timestamps automáticos de auditoria
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
    id         UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID             NOT NULL,                           -- Usuário proprietário da categoria
    family_id  UUID             NULL,                               -- Família associada (opcional)
    name       TEXT             NOT NULL,                           -- Nome da categoria
    type       transaction_type NOT NULL,                           -- Tipo: REVENUE ou EXPENSE
    deleted_at TIMESTAMPTZ      NULL,                               -- Soft delete timestamp
    created_at TIMESTAMPTZ      NOT NULL DEFAULT now(),             -- Data de criação do registro
    updated_at TIMESTAMPTZ      NOT NULL DEFAULT now(),             -- Data da última atualização

    CONSTRAINT fk_categories_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_categories_family
        FOREIGN KEY (family_id)
        REFERENCES familys(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================
COMMENT ON TABLE categories IS 'Tabela de categorias de transações com suporte a soft delete e tipos receita/despesa';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN categories.id         IS 'Identificador único da categoria (UUID v4)';
COMMENT ON COLUMN categories.user_id    IS 'Usuário proprietário da categoria';
COMMENT ON COLUMN categories.family_id  IS 'Família associada (opcional)';
COMMENT ON COLUMN categories.name       IS 'Nome da categoria';
COMMENT ON COLUMN categories.type       IS 'Tipo da categoria: REVENUE (receita) ou EXPENSE (despesa)';
COMMENT ON COLUMN categories.deleted_at IS 'Timestamp de soft delete (NULL = ativo, NOT NULL = deletado)';
COMMENT ON COLUMN categories.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN categories.updated_at IS 'Data e hora da última atualização (atualizado automaticamente)';