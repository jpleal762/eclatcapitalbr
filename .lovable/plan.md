
# Plano: Botao de Relatorio Semanal no Dashboard

## Objetivo
Adicionar um botao no primeiro dashboard que gera um relatorio com todos os KPIs, metas planejadas e valores realizados da semana, respeitando os filtros selecionados (assessor ou escritorio).

## Resumo da Solucao
Criar um componente de botao que, ao ser clicado, gera um arquivo Excel (.xlsx) contendo os dados do dashboard filtrados. O relatorio sera dinamico - se "TODOS" estiver selecionado, gera relatorio do escritorio; se um assessor especifico, gera relatorio individual.

---

## Detalhes Tecnicos

### 1. Criar Novo Componente: ReportButton.tsx

Localização: `src/components/dashboard/ReportButton.tsx`

```text
+----------------------------------+
|  [Download]  Relatorio Semanal   |
+----------------------------------+
```

Props:
- `dashboardData`: DashboardData (dados processados)
- `selectedAssessor`: string (filtro atual)
- `selectedMonth`: string (mes selecionado)

### 2. Estrutura do Relatorio Excel

O arquivo gerado tera multiplas abas:

**Aba 1 - Resumo**
| Campo | Valor |
|-------|-------|
| Periodo | fev-26 |
| Visao | Escritorio / Nome Assessor |
| ICM Geral | 85% |
| Ritmo Ideal | 45% |
| Dias Uteis Restantes | 12 |

**Aba 2 - Planejamento Semanal**
| KPI | Meta Semanal | Realizado | % Atingido | Falta |
|-----|--------------|-----------|------------|-------|
| Captacao NET | R$ 500.000 | R$ 320.000 | 64% | R$ 180.000 |
| Receita | R$ 25.000 | R$ 18.000 | 72% | R$ 7.000 |
| ... | ... | ... | ... | ... |

**Aba 3 - Metas Mensais (KPIs)**
| KPI | Meta Mensal | Realizado | % | Status |
|-----|-------------|-----------|---|--------|
| Captacao NET | R$ 2.000.000 | R$ 1.500.000 | 75% | Em andamento |
| Receita XP | R$ 100.000 | R$ 80.000 | 80% | No ritmo |
| ... | ... | ... | ... | ... |

### 3. Logica de Geracao

```typescript
// Pseudocodigo
function generateReport(dashboardData, assessor, month) {
  const wb = XLSX.utils.book_new();
  
  // Aba Resumo
  const resumoData = [
    ["Relatorio Semanal de KPIs"],
    [""],
    ["Periodo:", formatMonth(month)],
    ["Visao:", assessor === "all" ? "Escritorio Eclat" : assessor],
    ["Data de Geracao:", new Date().toLocaleString()],
    [""],
    ["ICM Geral:", `${dashboardData.icmGeral}%`],
    ["Ritmo Ideal:", `${dashboardData.ritmoIdeal}%`],
    ["Dias Uteis Restantes:", dashboardData.diasUteisRestantes]
  ];
  
  // Aba Planejamento Semanal (metaSemanal)
  // Aba KPIs Mensais (gaugeKPIs)
  
  // Exportar arquivo
  XLSX.writeFile(wb, `relatorio_${assessor}_${month}.xlsx`);
}
```

### 4. Posicao do Botao no Layout

Adicionar no card FlipICMCard, proximo aos filtros existentes:

```text
+------------------------------------------+
|  ICM Geral: 85%                          |
|  [Assessor: TODOS v] [Mes: fev-26 v]     |
|                                          |
|  [Download] Gerar Relatorio              |
+------------------------------------------+
```

### 5. Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/dashboard/ReportButton.tsx` | CRIAR - Novo componente do botao |
| `src/components/dashboard/FlipICMCard.tsx` | Adicionar botao de relatorio |
| `src/lib/reportUtils.ts` | CRIAR - Funcoes de geracao do Excel |

### 6. Dependencias

A biblioteca `xlsx` ja esta instalada no projeto (versao ^0.18.5), entao nao ha necessidade de adicionar dependencias.

### 7. Nome do Arquivo Gerado

Formato dinamico baseado nos filtros:
- Escritorio: `relatorio_escritorio_fev-26.xlsx`
- Assessor: `relatorio_joao_silva_fev-26.xlsx`

---

## Comportamento Esperado

1. Usuario clica no botao "Gerar Relatorio"
2. Sistema identifica o filtro ativo (escritorio ou assessor)
3. Gera arquivo Excel com dados correspondentes
4. Download automatico do arquivo
5. Toast de confirmacao: "Relatorio gerado com sucesso!"

## Validacoes

- Se nao houver dados carregados, botao fica desabilitado
- Valores monetarios formatados em Real (R$)
- Valores numericos com separador de milhar

