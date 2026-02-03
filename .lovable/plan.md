

# Plano: Realocar Botão e Gerar PDF

## Objetivo
1. Mover o botão de relatório para abaixo do título no ICMCard
2. Alterar a geração de Excel (.xlsx) para PDF

---

## Detalhes Técnicos

### 1. Realocar Botão de Relatório

**Problema Atual**: O botão está posicionado com `absolute top-2 right-2` no FlipICMCard, sobrepondo os filtros do ICMCard.

**Solução**: Mover o botão para dentro do ICMCard, logo abaixo do título "ICM Geral", ao lado direito.

**Layout Proposto**:
```
+------------------------------------------+
|  ICM Geral        [Relatório]            |
|  [Assessor v] [Mês v]                    |
|                                          |
|       [GAUGE 85%]                        |
+------------------------------------------+
```

### 2. Arquivos a Modificar para Posição

| Arquivo | Alteração |
|---------|-----------|
| `src/components/dashboard/FlipICMCard.tsx` | Remover ReportButton do overlay absoluto |
| `src/components/dashboard/ICMCard.tsx` | Adicionar ReportButton no header ao lado do título |

### 3. Mudança de Excel para PDF

**Abordagem**: Usar a biblioteca `jspdf` com `jspdf-autotable` para gerar tabelas formatadas em PDF.

**Nova dependência necessária**:
- `jspdf` - Biblioteca para geração de PDF
- `jspdf-autotable` - Plugin para criar tabelas automáticas

**Estrutura do PDF**:

```
Página 1:
+------------------------------------------+
|  RELATÓRIO SEMANAL DE KPIs               |
|  Escritório Eclat / Nome Assessor        |
|  Período: FEV/26                         |
|  Gerado em: 03/02/2026 às 14:30          |
+------------------------------------------+
|  INDICADORES GERAIS                      |
|  ICM Geral: 85%  |  Ritmo Ideal: 45%     |
|  Dias Úteis Restantes: 12                |
+------------------------------------------+
|  PLANEJAMENTO SEMANAL                    |
|  KPI    | Meta | Realizado | % | Falta   |
|  ...    | ...  | ...       |...|  ...    |
+------------------------------------------+
|  METAS MENSAIS (KPIs)                    |
|  KPI    | Meta | Realizado | % | Status  |
|  ...    | ...  | ...       |...|  ...    |
+------------------------------------------+
```

### 4. Modificações em reportUtils.ts

```typescript
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateWeeklyReportPDF = (
  dashboardData: DashboardData,
  selectedAssessor: string,
  selectedMonth: string
) => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(18);
  doc.text("RELATÓRIO SEMANAL DE KPIs", 14, 20);
  
  // Visão e Período
  doc.setFontSize(12);
  doc.text(`Visão: ${selectedAssessor === "all" ? "Escritório Eclat" : selectedAssessor}`, 14, 30);
  doc.text(`Período: ${selectedMonth.toUpperCase()}`, 14, 36);
  
  // Indicadores Gerais
  doc.setFontSize(14);
  doc.text("INDICADORES GERAIS", 14, 50);
  doc.setFontSize(11);
  doc.text(`ICM Geral: ${dashboardData.icmGeral}%`, 14, 58);
  doc.text(`Ritmo Ideal: ${dashboardData.ritmoIdeal}%`, 80, 58);
  doc.text(`Dias Úteis Restantes: ${dashboardData.diasUteisRestantes}`, 14, 64);
  
  // Tabela Planejamento Semanal
  autoTable(doc, {
    startY: 75,
    head: [['KPI', 'Meta Semanal', 'Realizado', '% Atingido', 'Falta']],
    body: dashboardData.metaSemanal.map(kpi => [...]),
    theme: 'striped'
  });
  
  // Tabela Metas Mensais
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 15,
    head: [['KPI', 'Meta Mensal', 'Realizado', '%', 'Status']],
    body: dashboardData.gaugeKPIs.map(kpi => [...]),
    theme: 'striped'
  });
  
  // Salvar
  doc.save(`relatorio_${visao}_${selectedMonth}.pdf`);
};
```

### 5. Resumo das Alterações

| Arquivo | Ação |
|---------|------|
| `src/components/dashboard/ICMCard.tsx` | Adicionar prop `dashboardData` e incluir ReportButton no header |
| `src/components/dashboard/FlipICMCard.tsx` | Remover ReportButton do overlay absoluto, passar dashboardData para ICMCard |
| `src/components/dashboard/ReportButton.tsx` | Atualizar para chamar função de PDF |
| `src/lib/reportUtils.ts` | Substituir lógica Excel por PDF usando jspdf |
| `package.json` | Adicionar dependências `jspdf` e `jspdf-autotable` |

---

## Comportamento Esperado

1. Botão aparece ao lado do título "ICM Geral" (não sobrepõe filtros)
2. Ao clicar, gera PDF com todas as informações
3. Download automático do arquivo PDF
4. Toast de confirmação: "Relatório PDF gerado!"

