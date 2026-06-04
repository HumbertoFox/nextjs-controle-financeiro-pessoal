-- ============================================================================
-- TABLE: budgets
-- Description: Armazena os orçamentos planejados dos usuários
-- Features:
--   - Soft delete habilitado via deleted_at
--   - Suporte a orçamentos pessoais e por família
--   - Período mensal ou anual via budget_period
--   - Timestamps automáticos de auditoria
-- ============================================================================
CREATE TABLE IF NOT EXISTS budgets (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID          NULL,                               -- Usuário associado (opcional)
    family_id     UUID          NULL,                               -- Família associada (opcional)
    category_id   UUID          NOT NULL,                           -- Categoria do orçamento
    planned_value NUMERIC(12,2) NOT NULL CHECK (planned_value > 0), -- Valor planejado
    period        budget_period NOT NULL,                           -- Período: MONTHLY ou YEARLY
    start_date    DATE          NOT NULL,                           -- Data de início
    end_date      DATE          NULL,                               -- Data de fim (NULL = sem prazo)
    deleted_at    TIMESTAMPTZ   NULL,                               -- Soft delete timestamp
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),             -- Data de criação do registro
    updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),             -- Data da última atualização

    CONSTRAINT fk_budgets_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_budgets_family
        FOREIGN KEY (family_id)
        REFERENCES familys(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,

    CONSTRAINT fk_budgets_category
        FOREIGN KEY (category_id)
        REFERENCES categories(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    CONSTRAINT chk_budgets_owner
        CHECK (user_id IS NOT NULL OR family_id IS NOT NULL)
);

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================
COMMENT ON TABLE budgets IS 'Tabela de orçamentos planejados com suporte a soft delete, períodos e vínculo pessoal ou familiar';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN budgets.id            IS 'Identificador único do orçamento (UUID v4)';
COMMENT ON COLUMN budgets.user_id       IS 'Usuário associado ao orçamento (opcional)';
COMMENT ON COLUMN budgets.family_id     IS 'Família associada ao orçamento (opcional)';
COMMENT ON COLUMN budgets.category_id   IS 'Categoria do orçamento';
COMMENT ON COLUMN budgets.planned_value IS 'Valor planejado para o orçamento (deve ser positivo)';
COMMENT ON COLUMN budgets.period        IS 'Período do orçamento: MONTHLY (mensal) ou YEARLY (anual)';
COMMENT ON COLUMN budgets.start_date    IS 'Data de início do orçamento';
COMMENT ON COLUMN budgets.end_date      IS 'Data de fim do orçamento (NULL = sem prazo definido)';
COMMENT ON COLUMN budgets.deleted_at    IS 'Timestamp de soft delete (NULL = ativo, NOT NULL = deletado)';
COMMENT ON COLUMN budgets.created_at    IS 'Data e hora de criação do registro';
COMMENT ON COLUMN budgets.updated_at    IS 'Data e hora da última atualização (atualizado automaticamente)';