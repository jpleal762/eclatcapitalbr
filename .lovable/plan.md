
## Diagnóstico

O problema está claro comparando as duas migrações:

1. **Migration `a201259d` (anterior)** — criou políticas com bypass para acesso sem token (`COALESCE(...) = ''`). Funcionava para o admin sem token.

2. **Migration `ff44f63a` (última executada)** — removeu esse bypass em `kpi_records`, exigindo `current_token_role() = 'admin'` ou `'socio'`. Quando o admin acessa o site sem `?token=` na URL, `current_token_role()` retorna `NULL` → todas as operações falham → dashboard vazio.

**Estado atual dos policies (confirmado pelo schema):**
- `kpi_records`: bloqueia acesso sem token ❌
- `kpi_snapshots`, `sprint_snapshots`, `sprint_challenges`: ainda exigem `is_valid_assessor_token(...)` com token vazio → também bloqueiam acesso sem token ❌

## O Que Fazer

Nova migration que restaura o bypass de acesso sem token em todas as tabelas afetadas. A lógica correta é:

```
Permitir SE:
  header x-assessor-token está vazio/ausente  ← acesso admin/escritório
  OU token é válido (admin ou sócio)          ← acesso via token
```

Além disso, para `kpi_records` especificamente, manter o isolamento de dados do sócio:
```
Sem token → acesso total
Token admin → acesso total
Token sócio → apenas registros onde assessor = nome do sócio
Token inválido → bloqueado
```

## Mudança Técnica

**1 nova migration SQL** que:
- Dropa as 4 políticas atuais de `kpi_records` e recria com o bypass + isolamento de sócio
- Dropa e recria políticas de `kpi_snapshots` (SELECT, INSERT, DELETE)
- Dropa e recria políticas de `sprint_snapshots` (SELECT, INSERT, DELETE)
- Dropa e recria políticas de `sprint_challenges` (SELECT, INSERT, UPDATE, DELETE)
- Dropa e recria políticas de write de `app_settings` (INSERT, UPDATE)

Nenhuma mudança de código frontend necessária.

```text
Antes (quebrado):
  admin sem token → current_token_role() = NULL → bloqueado

Depois (correto):
  admin sem token → COALESCE(header, '') = '' → permitido
  token admin     → current_token_role() = 'admin' → permitido
  token sócio     → permitido só nos próprios registros
  token inválido  → bloqueado
```
