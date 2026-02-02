

## Remoção: "Maiores Gaps" por Assessor na Tela Trimestral

### O que será removido

A seção que mostra "Maiores Gaps: ASSESSOR_1: -R$ XXK, ASSESSOR_2: -R$ XXK" em cada barra de progresso trimestral.

### Arquivos a Modificar

#### 1. `src/components/dashboard/QuarterlyKPIBar.tsx`

**Remover prop:**
- Linha 7: `topAssessorGaps?: AssessorQuarterlyGap[];`

**Remover da desestruturação (linha 63):**
- `topAssessorGaps`

**Remover bloco JSX (linhas 150-160):**
```tsx
{/* TOP 2 ASSESSOR GAPS - inline, compacto */}
{topAssessorGaps && topAssessorGaps.length > 0 && <div className="flex items-center gap-0.5">
    <span className="text-scale-5 text-muted-foreground mr-0.5">Maiores Gaps:</span>
    {topAssessorGaps.map(a => <span key={a.name} className={`...`}>
        {a.name}: -{formatValue(a.gap, isCurrency)}
      </span>)}
  </div>}
```

#### 2. `src/components/dashboard/AnalysisPage.tsx`

**Remover cálculo de assessor gaps:**
- Linhas no `kpisWithAssessorGaps` que calculam `topAssessorGaps`
- Simplificar para apenas calcular `monthlyGaps`

**Remover passagem de prop:**
- `topAssessorGaps={kpi.topAssessorGaps}` das chamadas de `QuarterlyKPIBar`

#### 3. `src/lib/quarterlyKpiUtils.ts`

**Opcional - limpar código não utilizado:**
- Remover função `calculateAssessorGapsForKPI` se não for usada em outro lugar
- Remover export de `AssessorQuarterlyGap` se não for mais necessário

### Resultado

As barras trimestrais continuarão exibindo:
- Label e percentual
- Barra de progresso com traços de mês e marcador de ritmo ideal
- Gaps acumulados abaixo dos traços de mês (nova funcionalidade)
- Valores realizados/meta, status de ritmo e "Falta"

**Removido:** Os badges "Maiores Gaps: ASSESSOR: -R$ XXK" não aparecerão mais.

