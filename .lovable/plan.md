
## Desafios Multi-KPI com prazo unico e somatorio geral

### O que muda

Atualmente, cada desafio e criado individualmente (1 KPI, 1 assessor, 1 prazo). A mudanca permite criar varios KPIs de uma vez com o mesmo prazo, e exibir um card de somatorio geral no topo.

### Mudancas no Modal (`SprintChallengeModal.tsx`)

- Trocar o select unico de KPI por **checkboxes multiplos** com os 7 produtos do SPRINT_PRODUCTS
- Cada KPI selecionado tera seu proprio **campo de meta** (input numerico ao lado)
- O campo de **prazo** continua unico e vale para todos os KPIs selecionados
- Ao salvar, insere N registros na tabela `sprint_challenges` (um por KPI), todos com o mesmo deadline
- Layout do modal: lista vertical com checkbox + label + input de meta lado a lado

### Mudancas no Layout da SprintPage (`SprintPage.tsx`)

- **Card de somatorio geral** no topo da pagina, mostrando:
  - Total de metas somadas (soma de todos target_value dos desafios ativos)
  - Total realizado somado
  - Percentual geral de progresso
  - Barra de progresso geral
  - Countdown do prazo (usando o menor deadline entre os desafios)
  - Mascote baseado no progresso geral
- **Abaixo**: grid de cards individuais por KPI (como ja existe), agrupados por assessor
- Layout limpo: card geral ocupa largura total, cards individuais em grid 2 colunas

### Mudancas no SprintChallengeCard (`SprintChallengeCard.tsx`)

- Sem mudancas estruturais, apenas mantem o comportamento atual

### Novo componente: `SprintChallengeSummary.tsx`

- Recebe todos os challenges ativos e o sprintData
- Calcula somatorio: soma de targets, soma de realizados, % geral
- Exibe card com:
  - Titulo: "Progresso Geral" + countdown
  - Barra de progresso grande
  - Valores: realizado total / meta total (X%)
  - Mascote e confetti no 100%
  - Contagem: "X de Y KPIs concluidos"

### Detalhes tecnicos

**Arquivos editados:**
- `src/components/dashboard/SprintChallengeModal.tsx` - multi-KPI com metas individuais, prazo unico
- `src/components/dashboard/SprintPage.tsx` - adicionar card de somatorio no topo

**Arquivo novo:**
- `src/components/dashboard/SprintChallengeSummary.tsx` - card de somatorio geral

**Banco de dados:** sem mudancas - cada KPI continua sendo um registro separado na tabela `sprint_challenges`, agrupados pelo mesmo deadline e assessor.
