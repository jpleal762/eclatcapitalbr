
## Desafios Sprint: Metas personalizadas por KPI/Assessor com prazo e gamificacao

### O que sera criado

Uma nova funcionalidade na tela de Sprint que permite criar "desafios" personalizados: o admin (ou socio para si mesmo) digita uma meta especifica por KPI, por assessor, com um prazo de entrega. O progresso e gamificado com countdown, status visual e celebracao ao atingir.

### Nova tabela no banco de dados

**Tabela: `sprint_challenges`**

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid (PK) | Identificador unico |
| created_at | timestamptz | Data de criacao |
| category | text | Categoria do KPI (ex: "Captação net") |
| assessor_name | text | Nome do assessor |
| target_value | numeric | Meta digitada pelo usuario |
| deadline | timestamptz | Prazo para entrega |
| month | text | Mes de referencia (ex: "fev-26") |
| created_by | text | Quem criou o desafio |
| is_active | boolean | Se o desafio esta ativo |

RLS: leitura e escrita publica (mesmo padrao das outras tabelas do projeto).

### Componentes novos

**1. `SprintChallengeModal.tsx`** - Modal para criar/editar desafios
- Selecionar assessor (dropdown com assessores disponiveis)
- Selecionar KPI/categoria (dropdown com produtos do sprint)
- Input numerico para a meta
- DatePicker para o prazo de entrega
- Botao salvar que grava na tabela `sprint_challenges`

**2. `SprintChallengeCard.tsx`** - Card compacto mostrando o desafio ativo
- Exibe: assessor, meta, realizado atual, % progresso
- Countdown ate o prazo (ex: "2d 5h restantes")
- Barra de progresso colorida (vermelho < 50%, amarelo >= 50%, verde >= 100%)
- Mascote do sprint baseado no progresso
- Efeito confetti ao atingir 100%
- Icone de alerta quando prazo esta proximo (< 24h)

### Integracao na SprintPage

- Botao "+" ou "Criar Desafio" no topo da Sprint page (ao lado dos filtros)
- Secao "Desafios Ativos" abaixo das barras de KPI, mostrando os desafios em andamento
- O valor "realizado" e calculado automaticamente a partir dos dados existentes do kpi_records (mesmo calculo que ja existe no sprint)
- Desafios expirados (prazo passou) ficam com visual cinza e label "Expirado"
- Desafios concluidos ficam verdes com mascote Champion

### Gamificacao

- **Countdown visual**: dias e horas restantes em destaque
- **Mascotes**: Runner (< 50%), Cyclist (50-79%), Rocket (80-99%), Champion (100%) - reutiliza o `SprintMascot` existente
- **Confetti**: ao atingir a meta, dispara celebracao (reutiliza `ConfettiCelebration`)
- **Cores de urgencia**: borda do card fica vermelha pulsante quando faltam menos de 24h
- **Status badges**: "Em andamento", "Quase la!", "Concluido!", "Expirado"

### Detalhes tecnicos

**Arquivos novos:**
- `src/components/dashboard/SprintChallengeModal.tsx` - modal de criacao
- `src/components/dashboard/SprintChallengeCard.tsx` - card de exibicao

**Arquivos editados:**
- `src/components/dashboard/SprintPage.tsx` - adicionar botao de criar desafio e secao de desafios ativos
- `src/types/kpi.ts` - tipo `SprintChallenge`

**Migracao SQL:**
- Criar tabela `sprint_challenges` com RLS

**Calculo do realizado:**
- Buscar do `kpi_records` o valor realizado do assessor para a categoria no mes, usando a mesma logica que `calculateSprintData` ja usa
- Comparar com `target_value` do desafio para calcular progresso
