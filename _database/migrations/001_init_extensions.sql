CREATE EXTENSION IF NOT EXISTS "pgcrypto";

COMMENT ON EXTENSION pgcrypto IS
'Fornece funções criptográficas incluindo gen_random_uuid() para gerar UUIDs.
Usado para gerar IDs primários em tabelas do sistema.';

CREATE EXTENSION IF NOT EXISTS "citext";

COMMENT ON EXTENSION citext IS
'Tipo de texto case-insensitive (CITEXT) para emails.
Garante que email@EXAMPLE.com = email@example.com nas comparações.';