-- ============================================================================
-- TABLE: familys
-- Description: Armazena informações das famílias do sistema
-- Features:
--   - Soft delete habilitado via deleted_at
--   - Timestamps automáticos de auditoria
-- ============================================================================
CREATE TABLE IF NOT EXISTS familys (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name       TEXT        NOT NULL,                            -- Nome da família
    deleted_at TIMESTAMPTZ NULL,                                -- Soft delete timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),              -- Data de criação do registro
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()               -- Data da última atualização
);

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================
COMMENT ON TABLE familys IS 'Tabela de famílias do sistema com suporte a soft delete';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN familys.id         IS 'Identificador único da família (UUID v4)';
COMMENT ON COLUMN familys.name       IS 'Nome da família (obrigatório)';
COMMENT ON COLUMN familys.deleted_at IS 'Timestamp de soft delete (NULL = ativo, NOT NULL = deletado)';
COMMENT ON COLUMN familys.created_at IS 'Data e hora de criação do registro';
COMMENT ON COLUMN familys.updated_at IS 'Data e hora da última atualização (atualizado automaticamente)';