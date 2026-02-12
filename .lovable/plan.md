
# Plano: Remover arquivos das telas Tatica da Semana e Prospecao e Qualidade

## Situacao atual

Essas telas ja foram removidas das rotas e navegacao anteriormente, mas os arquivos de componentes ainda existem no projeto como codigo morto (nao sao importados em nenhum lugar).

## Arquivos a deletar

| Arquivo | Motivo |
|---------|--------|
| `src/components/dashboard/TacticsWeekPage.tsx` | Tela Tatica da Semana (nao importado) |
| `src/components/dashboard/ProspectionQualityPage.tsx` | Tela Prospecao e Qualidade (nao importado) |
| `src/components/dashboard/AssessorTacticsCard.tsx` | Componente auxiliar usado apenas pela TacticsWeekPage |

## Limpeza no arquivo de tipos

**Arquivo:** `src/types/kpi.ts`

Remover os tipos e constantes orfas que so eram usados por essas telas:
- `PROSPECTION_QUALITY_KPIS` (array de config)
- `ProspectionKPIConfig` (interface, se existir)
- `WeeklyTactic` (interface)
- `AssessorTactics` (interface)

## Impacto

Nenhum impacto funcional -- esses componentes nao sao importados em nenhuma pagina ou rota ativa. E apenas limpeza de codigo morto.
