## 🗄 Banco de Dados – Migrations

Esta pasta contém todos os scripts SQL de migrations para o projeto Next.js.
O objetivo é organizar, versionar e aplicar alterações no banco de dados de forma segura, repetível e auditável.

---

### Estrutura da Pasta

`000_reset.sql` → Reseta o banco (drop triggers, functions, views, tables, enums, schema_migrations, extensões e role).

`001_init_extensions.sql` → Cria extensões necessárias no PostgreSQL (`pgcrypto`, `citext`).

`002_create_enums.sql` → Cria enums do sistema (`user_role`, `account_type`, `transaction_type`, `transaction_status`, `budget_period` e `goal_status`).

`003_create_family.sql` → Cria tabela `familys` com comentários e suporte a soft delete.

`004_create_users.sql` → Cria tabela `users` com comentários e suporte a soft delete.

`005_create_accounts.sql` → Cria tabela `accounts` com suporte a soft delete, múltiplos tipos de conta (`CURRENT`, `SAVINGS`, `CREDIT`, `INVESTMENT`, `DIGITAL`) e vínculo pessoal ou familiar.

`006_create_categories.sql` → Cria tabela `categories` com suporte a soft delete, tipos `REVENUE` e `EXPENSE` e vínculo pessoal ou familiar.

`007_create_transactions.sql` → Cria tabela `transactions` com suporte a soft delete, controle de status (`PENDING`, `CONFIRMED`, `CANCELLED`) e valor sempre positivo.

`008_create_budgets.sql` → Cria tabela `budgets` com suporte a soft delete, períodos `MONTHLY` e `YEARLY`, e constraint que exige vínculo com usuário ou família.

`009_create_financial_goals.sql` → Cria tabela `goals` com suporte a soft delete, controle de progresso via `current_value` e `target_value`, e constraint que exige vínculo com usuário ou família.

`010_create_views.sql` → Cria views públicas e administrativas para usuários.

`011_create_triggers.sql` → Cria função e trigger de atualização automática de `updated_at`.

`012_create_verification_tokens.sql` → Cria tabela `verification_tokens`.

`013_create_ratelimits.sql` → Cria tabela `rate_limits` para rate limiting persistido no banco.

`014_create_permissions.sql` → Cria role `<nome_do_banco>_backend_role` (derivada automaticamente do nome do banco), concede `USAGE` no schema `public`, aplica permissões via `GRANT`/`REVOKE` e políticas RLS para as tabelas `users`, `verification_tokens` e `rate_limits`.

`015_create_indexes.sql` → Cria todos os índices do banco: `idx_users_deleted_at`, `idx_verification_tokens_expires_at`, `idx_verification_tokens_identifier` e `idx_rate_limits_reset_at`.

**Os arquivos são executados em ordem alfabética/numerada, garantindo consistência.**

---

### Scripts Node.js

**Criar uma nova migration**

```bash
    npm run make:migration "descrição da migration"
```

- Cria um arquivo `.sql` na pasta `_database/migrations` com número sequencial automático, timestamp e descrição opcional convertida para snake_case.

Exemplo de arquivo gerado:

`016_20260208124500_add_profiles.sql`

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

**1. Nomear sequencialmente:** - Prefixo numérico (`016`, `017`) + timestamp + descrição (opcional).

**2. Idempotência:** - Sempre use `IF EXISTS` ou `IF NOT EXISTS` para evitar erros em execuções repetidas.

**3. Evitar dados sensíveis:** - Scripts devem focar em estrutura (tabelas, views, triggers).

**4. Separar lógica por arquivo:** - Cada alteração significativa deve ter uma migration própria.

---

### Referência

- **Extensões**: `pgcrypto`, `citext`.

- **Enum**: `user_role` → `ADMIN`, `USER`.

- **Tabelas:** `users`, `familys`, `accounts`, `categories`, `transactions`, `budgets`, `goals`, `verification_tokens`, `rate_limits`, `schema_migrations`

**Relações:**
- `users.family_id` → `familys.id` (ON DELETE SET NULL)

- `users.email` ↔ `verification_tokens.identifier`

- `verification_tokens.identifier` → `email:familyId` para convites de família

**Índices:**
- `idx_familys_deleted_at`

- `idx_users_deleted_at`, `idx_users_family_id`, `idx_users_role`

- `idx_users_one_owner_per_family` — índice único parcial que garante um único `is_owner = true` por família

- `idx_accounts_user_id`, `idx_accounts_family_id`, `idx_accounts_deleted_at`

- `idx_categories_user_id`, `idx_categories_type`, `idx_categories_deleted_at`

- `idx_transactions_user_id`, `idx_transactions_account_id`, `idx_transactions_category_id`, `idx_transactions_transaction_date`, `idx_transactions_status`, `idx_transactions_deleted_at`

- `idx_budgets_user_id`, `idx_budgets_category_id`, `idx_budgets_start_date`, `idx_budgets_deleted_at`

- `idx_goals_user_id`, `idx_goals_status`, `idx_goals_deadline`, `idx_goals_deleted_at`

- `idx_verification_tokens_expires_at`, `idx_verification_tokens_identifier`

- `idx_rate_limits_reset_at`

- **Função**: `update_updated_at` - compara **NEW** com **OLD** e só atualiza `updated_at` se houver mudança real.

- **Trigger**: `trigger_update_users_updated_at` - atualiza automaticamente `updated_at` na tabela `users`.

- **Views públicas** (`sem password`): `users_public`, `users_admin_public`, `users_public_active`.

**Views internas** (com `password` ou dados sensíveis, somente backend): `users_active`, `users_all`, `users_admin_public`, `accounts_active`, `transactions_detailed`, `budgets_with_spent`

- **Role**: `<nome_do_banco>_backend_role` — gerada automaticamente a partir do nome do banco definido na `DATABASE_URL`. Acesso exclusivo às tabelas `users`, `verification_tokens` e `rate_limits`, e à view `users_active`.

**RLS:** Row Level Security habilitado em `users`, `familys`, `accounts`, `categories`, `transactions`, `budgets`, `goals`, `verification_tokens` e `rate_limits`.