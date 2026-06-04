-- ============================================================================
-- TABLE: rate_limits
-- Description: Persiste tentativas de login para rate limiting distribuído.
--              Funciona em múltiplas instâncias e sobrevive a restarts.
-- ============================================================================
CREATE TABLE IF NOT EXISTS rate_limits (
    key         TEXT NOT NULL,
    count       INTEGER NOT NULL DEFAULT 1,
    reset_at    TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (key)
);

COMMENT ON TABLE rate_limits IS 'Rate limiting persistido por chave (ip:email, email, etc.)';