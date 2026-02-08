

# Plano: Mover controles para Configuracoes (secao existente) + Dobrar titulos + Icones nos cards

## 1. Mover controles do header para a secao "Controles do Dashboard" existente

Os botoes ThemeToggle, Edit3 (lapis) e Download (baixar base) serao removidos do header e adicionados como novas linhas dentro da secao "Controles do Dashboard" que ja existe no modal de Configuracoes, junto com Rotacao automatica, Flip de cards, Tela cheia e Visualizacao.

**Arquivo:** `src/pages/Index.tsx`
- Remover ThemeToggle, Edit3 e Download do header
- Passar novas props ao TokenAccessConfig: `onEditProduction`, `onExportDatabase`

**Arquivo:** `src/components/dashboard/TokenAccessConfig.tsx`
- Adicionar 3 itens na grid existente (bg-muted/30 rounded-lg, linhas ~192-258):
  - Tema escuro (Switch com Moon/Sun, usando useTheme de next-themes)
  - Editar Producao (botao que chama onEditProduction e fecha o modal)
  - Baixar Base de Dados (botao que chama onExportDatabase e fecha o modal)
- Novas props: `onEditProduction: () => void`, `onExportDatabase: () => void`

## 2. Dobrar o tamanho dos titulos dos cards

| Arquivo | De | Para |
|---------|-----|------|
| `GaugeChart.tsx` | `text-responsive-3xs` | `text-responsive-xs` |
| `FlipMetaTable.tsx` | `text-responsive-sm` | `text-responsive-lg` |
| `AssessorChart.tsx` | tamanho atual | dobro |
| `AgendadasCard.tsx` | `text-responsive-xs` | `text-responsive-sm` |
| `ICMCard.tsx` | tamanho atual | dobro |

## 3. Adicionar icones nos titulos dos cards

Mapeamento de icones Lucide por card:

| Card | Icone |
|------|-------|
| Primeiras Reunioes | CalendarCheck |
| Reunioes Agendadas | CalendarClock |
| Captacao NET | TrendingUp |
| Receita PJ1 XP | DollarSign |
| Receita PJ2 XP | Coins |
| Receita Parceiros | Handshake |
| Habilitacao | BadgeCheck |
| Ativacao | Zap |
| Diversificacao | PieChart |
| Planejamento | ClipboardList |
| Ranking Assessores | Trophy |
| ICM / Analise IA | Gauge |

**Arquivo:** `src/components/dashboard/GaugeChart.tsx` - Criar mapa label->icone, renderizar icone antes do titulo

**Arquivo:** `src/components/dashboard/FlipMetaTable.tsx` - Icone ClipboardList

**Arquivo:** `src/components/dashboard/AssessorChart.tsx` - Icone Trophy

**Arquivo:** `src/components/dashboard/AgendadasCard.tsx` - Icone CalendarClock

**Arquivo:** `src/components/dashboard/ICMCard.tsx` - Icone Gauge

## Resumo de arquivos alterados

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Index.tsx` | Remover 3 botoes do header; passar props ao TokenAccessConfig |
| `src/components/dashboard/TokenAccessConfig.tsx` | Adicionar tema, edicao e export dentro da secao "Controles do Dashboard" existente |
| `src/components/dashboard/GaugeChart.tsx` | Dobrar titulo + icones por label |
| `src/components/dashboard/FlipMetaTable.tsx` | Dobrar titulo + icone |
| `src/components/dashboard/AssessorChart.tsx` | Dobrar titulo + icone |
| `src/components/dashboard/AgendadasCard.tsx` | Dobrar titulo + icone |
| `src/components/dashboard/ICMCard.tsx` | Dobrar titulo + icone |
| `src/components/dashboard/FlipICMCard.tsx` | Propagar icone |

