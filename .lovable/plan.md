
## Changes needed across 3 areas:

### 1. `QuarterlyKPIBar.tsx` — "Maiores Gaps" alignment
Currently the assessor gap names are in a `<span>` floated to the right side of the label row. They should be positioned below the bar (aligned with "Falta p/ Ritmo" which is also below the bar on the right). Move `topAssessorGaps` display from the top label row to the bottom values row, right-aligned alongside "Falta p/ Ritmo".

### 2. `EvolutionCard.tsx` — Less prominent worst assessors
The `worstAssessors` names in red currently use `text-scale-6 font-bold text-red-500/70`. Reduce to `text-scale-5 font-normal text-red-400/60` to make them clearly secondary/subtle.

### 3. `AnalysisPage.tsx` — First screen layout: allow scroll, prevent clipping
Currently the KPI bars container uses `overflow-hidden lg:overflow-hidden` which clips content. Change to `overflow-y-auto` with a scrollbar on desktop too, so nothing gets cut. The `overflow-hidden` on lg was there to prevent scroll, but it causes content to be cut when there are many KPIs. We'll keep the `flex-1 min-h-0` flex layout but allow vertical scroll with a visible scrollbar via `overflow-y-auto`.

Specifically in `AnalysisPage.tsx`:
- Both KPI container divs (default/sorted view and by-category view): change `overflow-hidden lg:overflow-hidden` → `overflow-y-auto` so a scrollbar appears when needed
- This ensures all KPI bars are reachable without content being cut off

### Files to edit:
1. `src/components/dashboard/QuarterlyKPIBar.tsx` — move gaps to bottom row
2. `src/components/dashboard/EvolutionCard.tsx` — reduce worst assessors visual weight
3. `src/components/dashboard/AnalysisPage.tsx` — allow overflow-y-auto on KPI containers
