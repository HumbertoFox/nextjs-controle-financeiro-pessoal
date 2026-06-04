-- ============================================================================
-- TABLE: goals
-- Description: Armazena as metas financeiras dos usuários
-- Features:
--   - Soft delete habilitado via deleted_at
--   - Suporte a metas pessoais e por família
--   - Controle de progresso via current_value e target_value
--   - Timestamps automáticos de auditoria
-- ============================================================================
CREATE TABLE IF NOT EXISTS goals (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID          NULL,                                          -- Usuário associado (opcional)
    family_id     UUID          NULL,                                          -- Família associada (opcional)
    name          TEXT          NOT NULL,                                      -- Nome da meta
    target_value  NUMERIC(12,2) NOT NULL CHECK (target_value > 0),             -- Valor alvo da meta
    current_value NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (current_value >= 0), -- Valor acumulado atual
    deadline      DATE          NULL,                                          -- Prazo da meta (opcional)
    status        goal_status   NOT NULL DEFAULT 'IN_PROGRESS',                -- Status da meta
    deleted_at    TIMESTAMPTZ   NULL,                                          -- Soft delete timestamp
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),                        -- Data de criação do registro
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),                        -- Data da última atualização

    CONSTRAINT fk_goals_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_goals_family
        FOREIGN KEY (family_id)
        REFERENCES familys(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT chk_goals_owner
        CHECK (user_id IS NOT NULL OR family_id IS NOT NULL),

    CONSTRAINT chk_goals_progress
        CHECK (current_value <= target_value)
);

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================
COMMENT ON TABLE goals IS 'Tabela de metas financeiras com suporte a soft delete e vínculo pessoal ou familiar';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN goals.id            IS 'Identificador único da meta (UUID v4)';
COMMENT ON COLUMN goals.user_id       IS 'Usuário associado à meta (opcional)';
COMMENT ON COLUMN goals.family_id     IS 'Família associada à meta (opcional)';
COMMENT ON COLUMN goals.name          IS 'Nome da meta financeira';
COMMENT ON COLUMN goals.target_value  IS 'Valor alvo a ser atingido (deve ser positivo)';
COMMENT ON COLUMN goals.current_value IS 'Valor acumulado até o momento (não pode exceder target_value)';
COMMENT ON COLUMN goals.deadline      IS 'Prazo para atingir a meta (NULL = sem prazo definido)';
COMMENT ON COLUMN goals.status        IS 'Status da meta: IN_PROGRESS, COMPLETED ou CANCELLED';
COMMENT ON COLUMN goals.deleted_at    IS 'Timestamp de soft delete (NULL = ativo, NOT NULL = deletado)';
COMMENT ON COLUMN goals.created_at    IS 'Data e hora de criação do registro';
COMMENT ON COLUMN goals.updated_at    IS 'Data e hora da última atualização (atualizado automaticamente)';