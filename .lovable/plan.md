

# Plano: Controle de Permissoes e Mes Aberto para Producao

## Resumo

Implementar controle de acesso baseado em roles (Socio/Admin) usando o sistema de tokens existente, com restricao por mes aberto, validacao de upload em massa, e auditoria.

---

## 1. Alteracoes no Banco de Dados

### 1.1 Adicionar campo `role` na tabela `assessor_tokens`

```sql
ALTER TABLE assessor_tokens ADD COLUMN role text NOT NULL DEFAULT 'socio';
-- Valores possíveis: 'admin', 'socio'
```

### 1.2 Criar tabela `app_settings` para mes aberto

```sql
CREATE TABLE public.app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now(),
  updated_by text
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Leitura publica (todos precisam saber o mes aberto)
CREATE POLICY "Allow public read settings" ON app_settings
  FOR SELECT USING (true);

-- Insert/Update publico (admin valida no frontend)
CREATE POLICY "Allow public upsert settings" ON app_settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update settings" ON app_settings
  FOR UPDATE USING (true);

-- Inserir mes aberto padrao
INSERT INTO app_settings (key, value) VALUES ('open_month', 'fev-26');
```

### 1.3 Adicionar campos de auditoria na tabela `kpi_records`

```sql
ALTER TABLE kpi_records
  ADD COLUMN created_by text,
  ADD COLUMN updated_by text;
```

### 1.4 Adicionar `last_production_update_at` na tabela `assessor_tokens`

```sql
ALTER TABLE assessor_tokens
  ADD COLUMN last_production_update_at timestamptz;
```

### 1.5 Atualizar tipos gerados

O Supabase atualizara automaticamente `src/integrations/supabase/types.ts`.

---

## 2. Logica de Negocio

### 2.1 Arquivo novo: `src/lib/permissions.ts`

Funcoes utilitarias para verificar permissoes:

```typescript
// Verifica se o usuario eh admin
export function isAdmin(role: string | null): boolean

// Verifica se o mes esta aberto para lancamentos
export async function getOpenMonth(): Promise<string | null>

// Verifica se o usuario pode editar registros de um assessor
export function canEditAssessor(role: string, tokenAssessor: string, targetAssessor: string): boolean

// Valida arquivo XLSX para upload - socio so pode subir seus proprios dados
export function validateUploadPermissions(records: KPIRecord[], role: string, assessorName: string): { valid: boolean; error?: string }

// Valida que todas as linhas estao no mes aberto
export function validateMonthRestriction(records: KPIRecord[], openMonth: string): { valid: boolean; error?: string }
```

### 2.2 Fluxo do Upload em Massa (FileUpload)

```text
Upload XLSX
  |
  v
Parsear arquivo
  |
  v
Verificar mes aberto?
  |-- Nao --> Bloquear + aviso "Mes X nao esta aberto para lancamentos"
  |-- Sim --> Continuar
  |
  v
Verificar role?
  |-- Admin --> Permitir qualquer assessor
  |-- Socio --> Validar que TODAS as linhas sao do proprio assessor
       |-- Linhas de outro assessor --> Rejeitar + aviso "Arquivo contem registros de outros usuarios"
       |-- OK --> Continuar
  |
  v
Salvar dados
  |
  v
Atualizar last_production_update_at do socio
  |
  v
Atualizar campos de auditoria (created_by, updated_by)
```

---

## 3. Alteracoes nos Componentes

### 3.1 `src/pages/Index.tsx`

- Armazenar `role` e `assessorName` do token validado no estado
- Passar `role`, `assessorName`, e `openMonth` para componentes filhos
- Buscar `openMonth` de `app_settings` no carregamento

### 3.2 `src/components/dashboard/FileUpload.tsx`

- Receber novas props: `role`, `assessorName`, `openMonth`
- Antes de processar o arquivo:
  - Validar que o mes aberto permite lancamento
  - Se Socio: validar que todas as linhas sao do proprio assessor
- Exibir aviso discreto quando mes esta fechado (botao desabilitado + tooltip)
- Apos upload bem-sucedido: atualizar `last_production_update_at` e campos de auditoria

### 3.3 `src/components/dashboard/TokenAccessConfig.tsx`

- Adicionar secao "Mes Aberto" nas configuracoes:
  - Dropdown para selecionar o mes aberto para lancamentos
  - Apenas visivel para admins (modo escritorio)
- Exibir coluna de role na tabela de tokens (informativo)

### 3.4 `src/lib/storage.ts`

- Atualizar `saveExcelData()` para aceitar `createdBy` e `updatedBy` opcionais
- Atualizar funcao para registrar quem salvou
- Nova funcao `updateLastProductionUpdate(tokenId: string)` para atualizar timestamp do socio

---

## 4. Exibicao "Ultima Atualizacao do Socio"

- No header, quando o acesso eh via token (socio), exibir discretamente:
  `Atualizado em: DD/MM HH:MM`
- Buscar de `assessor_tokens.last_production_update_at` na validacao do token
- Atualizar apos qualquer operacao de producao bem-sucedida

---

## 5. Resumo dos Arquivos Afetados

| Arquivo | Tipo de Alteracao |
|---------|-------------------|
| Migration SQL | Criar tabela `app_settings`, alterar `assessor_tokens` e `kpi_records` |
| `src/lib/permissions.ts` | **Novo** - funcoes de permissao |
| `src/lib/storage.ts` | Adicionar auditoria no save |
| `src/pages/Index.tsx` | Estado de role/openMonth, passar props |
| `src/components/dashboard/FileUpload.tsx` | Validacoes de permissao e mes |
| `src/components/dashboard/TokenAccessConfig.tsx` | Config de mes aberto |

---

## 6. Regras de Seguranca Resumidas

| Regra | Socio | Admin |
|-------|-------|-------|
| Upload em massa | Apenas seus registros | Qualquer assessor |
| Criar/Editar/Excluir | Apenas seus registros | Tudo |
| Mes aberto | So opera no mes aberto | So opera no mes aberto |
| Definir mes aberto | Nao | Sim |
| Ver configuracoes | Nao | Sim |

---

## Observacoes

- A validacao de permissao ocorre no frontend pois nao ha autenticacao Supabase Auth (apenas tokens). As politicas RLS continuam publicas como ja estao.
- O campo `role` no token determina se o acesso eh de admin ou socio.
- O modo "Escritorio" (sem token na URL) continua funcionando como admin implicitamente.

