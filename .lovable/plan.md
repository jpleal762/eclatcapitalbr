

## Plano: Alterações na Análise Trimestral e Controle de Acesso por Token

### Resumo das Mudanças

1. **Cor cinza nos gaps**: Mudar os indicadores de gap acumulado para cor cinza
2. **Rotação desligada por padrão**: Iniciar com rotação de páginas e flip de cards desativados
3. **Configuração de acesso por token**: Adicionar sistema para controlar quais telas cada token pode acessar

---

### Parte 1: Gaps em Cor Cinza

#### Arquivo: `src/components/dashboard/QuarterlyKPIBar.tsx`

Alterar a linha 131:
```typescript
// De:
<span className="text-scale-5 lg:text-scale-6 font-semibold text-red-500 whitespace-nowrap">

// Para:
<span className="text-scale-5 lg:text-scale-6 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
```

---

### Parte 2: Rotação Desligada por Padrão

#### Arquivo: `src/pages/Index.tsx`

Alterar linhas 114-115:
```typescript
// De:
const [isPageRotationEnabled, setIsPageRotationEnabled] = useState(true);
const [isCardFlippingEnabled, setIsCardFlippingEnabled] = useState(true);

// Para:
const [isPageRotationEnabled, setIsPageRotationEnabled] = useState(false);
const [isCardFlippingEnabled, setIsCardFlippingEnabled] = useState(false);
```

---

### Parte 3: Configuração de Acesso por Token

#### 3.1 Migração de Banco de Dados

Adicionar coluna para armazenar telas permitidas por token:

```sql
ALTER TABLE assessor_tokens 
ADD COLUMN allowed_screens text[] DEFAULT ARRAY['dashboard', 'analysis', 'prospection', 'sprint', 'tactics']::text[];
```

Telas disponíveis:
- `dashboard` - Dashboard principal mensal
- `analysis` - Análise Trimestral
- `prospection` - Prospecção
- `sprint` - Sprint
- `tactics` - Táticas da Semana

#### 3.2 Novo Componente: `TokenAccessConfig.tsx`

Criar modal de configuração com:
- Lista de tokens existentes
- Checkboxes para cada tela por token
- Botão de salvar

```typescript
interface TokenAccessConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

// Componente exibe tabela com:
// | Assessor | Dashboard | Análise | Prospecção | Sprint | Táticas |
// |----------|-----------|---------|------------|--------|---------|
// | Hingrid  |    ✓      |    ✓    |     ✓      |   ✗    |    ✓    |
```

#### 3.3 Botão de Configuração no Header

Apenas visível quando NÃO está em acesso via token (escritório):

```tsx
{!isTokenLocked && (
  <Button variant="ghost" size="icon" onClick={() => setIsConfigOpen(true)}>
    <Settings className="h-4 w-4" />
  </Button>
)}
```

#### 3.4 Validação de Acesso às Telas

No `Index.tsx`, ao validar token, carregar `allowed_screens`:

```typescript
const { data } = await supabase
  .from("assessor_tokens")
  .select("assessor_name, is_active, allowed_screens")
  .eq("token", tokenToValidate)
  .maybeSingle();

// Guardar telas permitidas no estado
setAllowedScreens(data.allowed_screens || ['dashboard']);
```

Filtrar rotação automática e PageToggle para mostrar apenas telas permitidas.

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/QuarterlyKPIBar.tsx` | Mudar cor dos gaps para cinza |
| `src/pages/Index.tsx` | Desabilitar rotação por padrão, adicionar lógica de telas permitidas |
| `src/components/dashboard/TokenAccessConfig.tsx` | **NOVO** - Modal de configuração de acesso |
| `src/components/dashboard/PageToggle.tsx` | Filtrar telas baseado em `allowedScreens` |
| Migração SQL | Adicionar coluna `allowed_screens` |

---

### Fluxo de Uso

1. **Escritório (sem token)**: 
   - Acesso a todas as telas
   - Botão de engrenagem (⚙️) no header para configurar acessos dos tokens

2. **Acesso via Token**:
   - Carrega `allowed_screens` do banco
   - PageToggle mostra apenas telas permitidas
   - Rotação automática apenas entre telas permitidas
   - Sem botão de configuração

---

### Interface de Configuração

```text
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Configurar Acesso dos Assessores                 ✕  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Assessor         │ 📊 │ 📈 │ 🎯 │ 🏃 │ 📋 │        │ │
│ ├──────────────────┼────┼────┼────┼────┼────┤        │ │
│ │ Hingrid Bold     │ ✓  │ ✓  │ ✓  │ ✗  │ ✓  │        │ │
│ │ José Júlio       │ ✓  │ ✓  │ ✗  │ ✗  │ ✓  │        │ │
│ │ Marcela Maria    │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │        │ │
│ │ Onacilda Barros  │ ✓  │ ✓  │ ✓  │ ✗  │ ✗  │        │ │
│ │ Rômulo Vicente   │ ✓  │ ✓  │ ✓  │ ✓  │ ✓  │        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Legenda: 📊 Dashboard  📈 Análise  🎯 Prospecção        │
│          🏃 Sprint  📋 Táticas                          │
│                                                         │
│                              [ Cancelar ] [ Salvar ]    │
└─────────────────────────────────────────────────────────┘
```

