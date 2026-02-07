
# Plano: Lapis de Edicao nos Cards + Download da Base de Dados

## Resumo

Duas funcionalidades:
1. Adicionar um icone de lapis (Edit) em cada card de gauge KPI para editar a producao daquele item especifico, abrindo o modal de edicao ja filtrado pela categoria do card.
2. Adicionar um botao para baixar a base de dados atualizada em formato XLSX.

---

## 1. Lapis de Edicao nos Cards

### Abordagem

Cada `GaugeChart` e `FlipGaugeChart` recebera uma nova prop opcional `onEditProduction` (callback). Quando presente, um pequeno icone de lapis aparecera no canto do card. Ao clicar, abrira o `ProductionEditModal` ja filtrado pela categoria especifica daquele KPI.

### Alteracoes

**1.1 `ProductionEditModal.tsx`** - Adicionar prop opcional `filterCategory`
- Quando `filterCategory` e passado, o modal filtra `kpi_records` somente para aquela categoria (e.g., `categorias = 'Captacao net'`)
- O titulo do modal mostra qual categoria esta sendo editada

**1.2 `GaugeChart.tsx`** - Adicionar prop `onEditProduction`
- Nova prop opcional: `onEditProduction?: () => void`
- Quando presente, renderiza um pequeno botao com icone de lapis no header do card (ao lado do titulo)
- O `onClick` chama `onEditProduction` (com `e.stopPropagation()` para nao interferir com flip)

**1.3 `FlipGaugeChart.tsx`** - Repassar `onEditProduction` para o `GaugeChart` interno

**1.4 `Index.tsx`** - Conectar tudo
- Novo estado: `productionEditCategory` (string | null) para saber qual categoria filtrar
- Criar funcao `handleEditProductionForKPI(category: string)` que define a categoria e abre o modal
- Passar `onEditProduction={() => handleEditProductionForKPI("Captacao net")}` para cada GaugeChart/FlipGaugeChart
- Passar `filterCategory={productionEditCategory}` para o `ProductionEditModal`
- Mapeamento dos indices de `gaugeKPIs` para as categorias corretas usando `KPI_CATEGORIES`

### Permissoes (mantidas)
- Socio: so edita registros do proprio assessor
- Admin: edita todos
- Mes fechado: botao desabilitado ou oculto

---

## 2. Download da Base de Dados (XLSX)

### Abordagem

Adicionar um botao de download no header do dashboard (ao lado dos botoes existentes). Ao clicar, busca todos os `kpi_records` do banco, transforma de volta para o formato XLSX original e baixa o arquivo.

### Alteracoes

**2.1 `src/lib/exportUtils.ts`** - Novo arquivo
- Funcao `exportDatabaseToXLSX()`:
  - Busca todos os registros de `kpi_records`
  - Transforma de volta para formato tabular (Assessor, Categorias, Status, colunas de meses)
  - Usa a biblioteca `xlsx` (ja instalada) para gerar o arquivo
  - Faz download automatico com nome `base_dados_YYYY-MM-DD.xlsx`

**2.2 `Index.tsx`** - Adicionar botao de download
- Botao com icone `Download` ao lado do botao de edicao no header
- Visivel para todos (admin e socio)
- Chama `exportDatabaseToXLSX()`

---

## 3. Resumo dos Arquivos

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/dashboard/GaugeChart.tsx` | Nova prop `onEditProduction`, icone de lapis |
| `src/components/dashboard/FlipGaugeChart.tsx` | Repassar `onEditProduction` |
| `src/components/dashboard/ProductionEditModal.tsx` | Nova prop `filterCategory` para filtrar por categoria |
| `src/lib/exportUtils.ts` | **Novo** - funcao de export XLSX |
| `src/pages/Index.tsx` | Estado de categoria, callbacks nos cards, botao download |

---

## Detalhes Tecnicos

### Mapeamento Card -> Categoria (baseado em KPI_CATEGORIES)

```text
gaugeKPIs[0] -> "Captacao net"      (Graph 3 - Captacao NET)
gaugeKPIs[1] -> "Receita"           (Graph 2 - Receita XP)
gaugeKPIs[2] -> "Primeira reuniao"  (Graph 3 - Primeiras Reunioes)
gaugeKPIs[3] -> "Diversificada ( ROA>1,5)" (Graph 4)
gaugeKPIs[4] -> "Parceiros Tri"     (Graph 5)
gaugeKPIs[5] -> "PJ1 XP Mes"       (Graph 6)
gaugeKPIs[6] -> "PJ2 XP Mes"       (Graph 7)
gaugeKPIs[7] -> "Habilitacao"       (Graph 8)
gaugeKPIs[8] -> "Ativacao"          (Graph 9)
```

### Export XLSX - Formato de saida

```text
| Assessor | Categorias | Status | jan-26 | fev-26 | mar-26 | ... |
|----------|------------|--------|--------|--------|--------|-----|
```

Reconstroi o formato original do upload a partir do campo `monthly_data` (JSONB) de cada registro.
