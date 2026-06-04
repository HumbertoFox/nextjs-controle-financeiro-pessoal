## 🗄 Banco de Dados – Migrations

Esta pasta contém todos os scripts SQL de migrations para o projeto Next.js.
O objetivo é organizar, versionar e aplicar alterações no banco de dados de forma segura, repetível e auditável.

---

### Estrutura da Pasta

`000_reset.sql` → Reseta o banco (drop triggers, functions, views, tables, enums, schema_migrations, extensões e role).

`001_init_extensions.sql` → Cria extensões necessárias no PostgreSQL (`pgcrypto`, `citext`).

`002_create_enums.sql` → Cria enums do sistema (`user_role`).

`003_create_users.sql` → Cria tabela `users` com índices, comentários e suporte a soft delete.

`004_create_views.sql` → Cria views públicas e administrativas para usuários.

`005_create_triggers.sql` → Cria função e trigger de atualização automática de `updated_at`.

`006_create_verification_tokens.sql` → Cria tabela `verification_tokens`.

`007_create_ratelimits.sql` → Cria tabela `rate_limits` para rate limiting persistido no banco.

`008_create_permissions.sql` → Cria role `<nome_do_banco>_backend_role` (derivada automaticamente do nome do banco), concede `USAGE` no schema `public`, aplica permissões via `GRANT`/`REVOKE` e políticas RLS para as tabelas `users`, `verification_tokens` e `rate_limits`.

`009_create_indexes.sql` → Cria todos os índices do banco: `idx_users_deleted_at`, `idx_verification_tokens_expires_at`, `idx_verification_tokens_identifier` e `idx_rate_limits_reset_at`.

**Os arquivos são executados em ordem alfabética/numerada, garantindo consistência.**

---

### Scripts Node.js

**Criar uma nova migration**

```bash
    npm run make:migration "descrição da migration"
```

- Cria um arquivo `.sql` na pasta `_database/migrations` com número sequencial automático, timestamp e descrição opcional convertida para snake_case.

Exemplo de arquivo gerado:

`010_20260208124500_add_profiles.sql`

**Observações importantes:**

- Não inclua aspas no nome do arquivo; use apenas a descrição dentro das aspas do comando.

- Todos os caracteres especiais (como `!`, `.`, `-`) serão removidos automaticamente.

- Espaços são convertidos em underscores `_`.

**Rodar migrations**

```bash
    npm run db:migrate
```

- Verifica se o banco existe e o cria automaticamente caso não exista.

- Executa todas as migrations não aplicadas, em ordem.

- Registra cada migration aplicada na tabela `schema_migrations` com hash do conteúdo.

- Detecta alterações em migrations já aplicadas e emite aviso.

Mensagens detalhadas:

- ↷ `Skipping: <arquivo>` → migration já aplicada e sem alterações.

- `⚠️ Migration "<arquivo>" was modified after it was applied!` → migration alterada após execução.

- `→ Running: <arquivo.sql>` → migration aplicada.

- `✅ X migration(s) executed successfully.` → migrations aplicadas.

- `ℹ️ Database is already up to date.` → todas as migrations já foram aplicadas.

**Resetar o banco**

```bash
    npm run db:reset
```

- Aplica 000_reset.sql e limpa todas as tabelas.

- **⚠️ Apaga todos os dados. Não usar em produção.**

Após o reset, rode:

```bash
npm run db:migrate
```

**Reset + migrate**

```bash
    npm run db:setup
```

Equivale a `db:reset` seguido de `db:migrate`.

---

### Boas práticas para novas migrations

**1. Nomear sequencialmente:** - Prefixo numérico (`010`, `011`) + timestamp + descrição (opcional).

**2. Idempotência:** - Sempre use `IF EXISTS` ou `IF NOT EXISTS` para evitar erros em execuções repetidas.

**3. Evitar dados sensíveis:** - Scripts devem focar em estrutura (tabelas, views, triggers).

**4. Separar lógica por arquivo:** - Cada alteração significativa deve ter uma migration própria.

---

### Referência

- **Extensões**: `pgcrypto`, `citext`.

- **Enum**: `user_role` → `ADMIN`, `USER`.

- **Tabelas**: `users`, `verification_tokens`, `rate_limits`, `schema_migrations`.

- **Índices**: `idx_users_deleted_at`, `idx_verification_tokens_expires_at`, `idx_verification_tokens_identifier`, `idx_rate_limits_reset_at`.

- **Função**: `update_updated_at` - compara **NEW** com **OLD** e só atualiza `updated_at` se houver mudança real.

- **Trigger**: `trigger_update_users_updated_at` - atualiza automaticamente `updated_at` na tabela `users`.

- **Views públicas** (`sem password`): `users_public`, `users_admin_public`, `users_public_active`.

- **View interna** (com `password`, somente backend): `users_active`.

- **Role**: `<nome_do_banco>_backend_role` — gerada automaticamente a partir do nome do banco definido na `DATABASE_URL`. Acesso exclusivo às tabelas `users`, `verification_tokens` e `rate_limits`, e à view `users_active`.

- **RLS**: Row Level Security habilitado na tabela `users` e `rate_limits` - `PUBLIC` só acessa via views.