-- ============================================================================
-- TABLE: users
-- Description: Armazena informações dos usuários do sistema
-- Features:
--   - Soft delete habilitado via deleted_at
--   - Suporte a autenticação por senha e OAuth (password nullable)
--   - Email case-insensitive (CITEXT)
--   - Timestamps automáticos de auditoria
--   - Sessão única por usuário via session_version
--   - Controle de ownership de família via is_owner
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id           UUID        NULL,                               -- ID da família (opcional, para relacionar usuários a famílias)
    session_version     INT         NOT NULL DEFAULT 1,                 -- Versão da sessão ativa
    name                TEXT        NOT NULL,                           -- Nome completo do usuário
    email               CITEXT      UNIQUE NOT NULL,                    -- Email único (case-insensitive)
    password            TEXT        NULL,                               -- Hash da senha (NULL para OAuth/SSO)
    role                user_role   NOT NULL DEFAULT 'INDIVIDUAL',      -- Nível de acesso do usuário
    is_owner            BOOLEAN     NOT NULL DEFAULT false,             -- true = criador/dono da família
    email_verified      TIMESTAMPTZ NULL,                               -- Data/hora de verificação do email
    password_changed_at TIMESTAMPTZ NULL,                               -- Data/hora da última troca de senha (invalida sessões antigas)
    avatar              TEXT        NULL,                               -- URL ou path do avatar
    deleted_at          TIMESTAMPTZ NULL,                               -- Soft delete timestamp
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),             -- Data de criação do registro
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),             -- Data da última atualização

    CONSTRAINT fk_users_family
        FOREIGN KEY (family_id)
        REFERENCES familys(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================
COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema com suporte a soft delete, autenticação múltipla, controle de sessão única via session_version e ownership de família via is_owner';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN users.id                  IS 'Identificador único do usuário (UUID v4)';
COMMENT ON COLUMN users.family_id           IS 'Identificador da família associada (NULL = sem família)';
COMMENT ON COLUMN users.session_version     IS 'Versão da sessão ativa — incrementado a cada login para invalidar tokens anteriores';
COMMENT ON COLUMN users.name                IS 'Nome completo do usuário';
COMMENT ON COLUMN users.email               IS 'Email único do usuário (case-insensitive via CITEXT)';
COMMENT ON COLUMN users.password            IS 'Hash bcrypt da senha (NULL para autenticação OAuth/SSO)';
COMMENT ON COLUMN users.role                IS 'Nível de acesso: ADMIN, INDIVIDUAL ou MEMBER';
COMMENT ON COLUMN users.is_owner            IS 'Indica se o usuário é o criador/dono da família (false = membro comum, true = dono)';
COMMENT ON COLUMN users.email_verified      IS 'Timestamp de verificação do email (NULL = não verificado)';
COMMENT ON COLUMN users.password_changed_at IS 'Timestamp da última troca de senha — usado para invalidar JWTs emitidos antes da troca (NULL = senha nunca trocada desde a criação)';
COMMENT ON COLUMN users.avatar              IS 'URL ou caminho do arquivo de avatar do usuário';
COMMENT ON COLUMN users.deleted_at          IS 'Timestamp de soft delete (NULL = ativo, NOT NULL = deletado)';
COMMENT ON COLUMN users.created_at          IS 'Data e hora de criação do registro';
COMMENT ON COLUMN users.updated_at          IS 'Data e hora da última atualização (atualizado automaticamente)';