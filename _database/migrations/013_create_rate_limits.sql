-- ============================================================================
-- TABLE: rate_limits
-- Description: Persiste tentativas de login para rate limiting distribuído.
-- Features:
--   - Funciona em múltiplas instâncias sem estado compartilhado em memória
--   - Sobrevive a restarts do servidor
--   - Chave composta livre (ex: "ip:email", "email", "ip")
--   - Reset automático via reset_at (sem necessidade de cron de limpeza ativo)
-- ============================================================================
CREATE TABLE IF NOT EXISTS rate_limits (
    key         TEXT NOT NULL,               -- Chave de identificação do limite (ex: "ip:email")
    count       INTEGER NOT NULL DEFAULT 1,  -- Número de tentativas na janela atual
    reset_at    TIMESTAMPTZ NOT NULL,        -- Momento em que o contador deve ser zerado
    PRIMARY KEY (key)
);

-- ============================================================================
-- TABLE COMMENT
-- ============================================================================
COMMENT ON TABLE rate_limits IS 'Rate limiting persistido por chave arbitrária (ip:email, email, ip, etc.) para controle distribuído de tentativas';

-- ============================================================================
-- COLUMN COMMENTS
-- ============================================================================
COMMENT ON COLUMN rate_limits.key      IS 'Chave única de rate limiting (ex: "127.0.0.1:user@email.com")';
COMMENT ON COLUMN rate_limits.count    IS 'Contador de tentativas na janela de tempo atual';
COMMENT ON COLUMN rate_limits.reset_at IS 'Timestamp de expiração da janela — após este momento o contador pode ser reiniciado';