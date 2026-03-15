
## TV Dashboard — Gestão à Vista Éclat

### Overview
Create a completely separate TV mode accessible via a new route `/tv`, preserving all existing screens at `/`. The TV dashboard will auto-rotate through 4 screens using the existing data layer (same KPI calculations, same database).

### Architecture

```text
New files to create:
├── src/pages/TVDashboard.tsx           ← Main TV page, routing + data orchestration
├── src/components/tv/TVLayout.tsx      ← Shared dark layout wrapper (header, clock, progress dots)
├── src/components/tv/TVScreen1.tsx     ← Comando do Dia
├── src/components/tv/TVScreen2.tsx     ← Performance dos KPIs
├── src/components/tv/TVScreen3.tsx     ← Performance por Assessor
├── src/components/tv/TVScreen4.tsx     ← Reconhecimento e Cultura
└── src/components/tv/TVConfig.tsx      ← Config modal (mensagem, KPI prioridade, rotação)
```

New route added to App.tsx:
```text
<Route path="/tv" element={<TVDashboard />} />
```

No changes to existing files except App.tsx (+1 route).

---

### Data Layer (reuse 100%)
`TVDashboard.tsx` will import and use the exact same functions as Index.tsx:
- `processDashboardData()` → ICM, ritmoIdeal, gaugeKPIs, assessorPerformance
- `calculateSprintData()` → weekly targets (for funil data)
- `formatNumber()` → currency formatting
- `getKPIStatusIcon()` → semantic color logic
- Same Supabase `kpi_records` data load via `loadExcelData()`

TV config (mensagem do dia, prioridade KPI, rotação ativa) stored in `app_settings` table with keys `tv-config-*`.

---

### Design System (dark theme, TV-first)

```text
Background: bg-[#0D0D0D] (near-black graphite)
Cards:      bg-[#161616] border border-[#2a2a2a]
Accent:     #FFBF00 (Éclat gold) — used ONLY for logos, highlights, leaders
Green:      #22c55e / text-green-400
Yellow:     #eab308 / text-yellow-400
Red:        #ef4444 / text-red-400
Gray:       #6b7280 for neutral/inactive
Typography: text-white primary, font-bold for numbers
```

Status color function: `getStatusColor(percentage, ritmoIdeal)` → green/yellow/red/gray

---

### Screen 1 — Comando do Dia (20s)

```text
┌─────────────────────────────────────────────────────┐
│ LOGO   [REALIZADO 47%] [RITMO 52%] [3 DU] [STATUS]  │ ← top strip
├──────────────┬────────────────────┬──────────────────┤
│              │                    │                  │
│  RANKING     │   FUNIL COMERCIAL  │   GARGALO        │
│  ASSESSORES  │   (barras horiz.)  │   DO MÊS         │
│              │                    │                  │
│  1. Nome 72% │  Reunião   ■■■ 65% │  KPI: Captação   │
│  2. Nome 65% │  Habilit.  ■■ 48%  │  Meta: R$ 10M    │
│  ...         │  Ativaçao  ■ 30%   │  Real: R$ 4.7M   │
│              │  Captação  ■■■ 70% │  Falta: R$ 5.3M  │
│              │  Receita   ■■■ 61% │  Top gap: Fulano │
│              │  Diversif. ■ 22%   │                  │
├──────────────┴────────────────────┴──────────────────┤
│  META DO DIA: Diagnóst. 2 | Habilit. 1 | Capt. 500k │ ← footer strip
│  💬 "Foco: gerar diagnósticos e avançar habilitações" │
└─────────────────────────────────────────────────────┘
```

**Status logic**: `(icmGeral - ritmoIdeal)` → ≥0: verde "No ritmo", -5 to 0: amarelo "Atenção", <-5: vermelho "Abaixo"

**Gargalo**: find gaugeKPI with lowest `percentage / ritmoIdeal` ratio (gap relativo). Show KPI name, value, target, gap, and which assessors contribute most to the gap via `calculateAssessorRemainingForKPI()`.

**Meta do dia**: derived as `(planejado_mes / totalDiasUteis)` for each KPI.

---

### Screen 2 — Performance dos KPIs (12s)

```text
┌──────────────────────────────────────────────────────┐
│ LOGO                    PERFORMANCE DOS KPIs          │
├──────────────────────────────────────────────────────┤
│ KPI               BARRA               %    META   GAP │
│ Captação NET  [■■■■■■■■░░░░░░]  68%  R$10M  R$3.2M  │ (sorted worst first)
│ Habilitação   [■■■■░░░░░░░░░░]  32%    12     8     │
│ ...                                                   │
└──────────────────────────────────────────────────────┘
```

Sort by `percentage ASC` (worst first). Color bars by status. Vertical rhythm marker on each bar.

---

### Screen 3 — Performance por Assessor (12s)

```text
┌──────────────────────────────────────────────────────┐
│ LOGO               PERFORMANCE POR ASSESSOR           │
├───────┬──────┬──────┬──────┬──────┬──────┬──────────┤
│ NOME  │ ICM  │ DIAG │ HABI │ ATIV │ CAPT │ GAP PPAL │
│ José  │  72% │   3  │   2  │   1  │ 1.2M │          │
│ Marca │  48% │   1  │   0  │   0  │ 0.5M │ Habilit. │
│ ...   │      │      │      │      │      │          │
└───────┴──────┴──────┴──────┴──────┴──────┴──────────┘
```

Row color: green if ICM ≥ ritmoIdeal, red if < 25% of ritmoIdeal. "Principal gap" = KPI with biggest relative lag for that assessor.

---

### Screen 4 — Reconhecimento e Cultura (8s)

```text
┌──────────────────────────────────────────────────────┐
│              ⭐ RECONHECIMENTO DO TIME                 │
│  [Líder]   [Top Captação]  [Top Execução]  [Evolução] │
│  [Zona Crítica]                                       │
└──────────────────────────────────────────────────────┘
```

Cards with large names, simple metrics, animated gold border for leader. "Zona crítica" shows assessors below 35% ICM.

---

### TVConfig Modal
Accessible via gear icon on TV layout. Persists to `app_settings` via Supabase:
- `tv-mensagem-dia`: custom text (default: auto from gargalo)
- `tv-kpi-prioridade`: which KPI is focus (dropdown)
- `tv-rotation-active`: boolean
- `tv-screen-durations`: JSON with per-screen seconds

---

### Auto-rotation Logic
`TVDashboard.tsx` manages rotation with `useEffect` + `setInterval`:
- Screen durations: [20, 12, 12, 8] seconds (configurable)
- Progress dots shown in header
- Pause on hover (mouse over)
- Manual nav with keyboard arrows
- Data auto-refreshes every 5 min

---

### Navigation Entry Point
Add a TV icon button to the existing dashboard header (visible only when not token-locked) that opens `/tv` in a new tab. This is the only change to existing files besides App.tsx routing.

---

### Implementation Order
1. App.tsx — add `/tv` route
2. TVLayout.tsx — dark shell, header, countdown dots, clock
3. TVDashboard.tsx — data loading, rotation state, config
4. TVScreen1.tsx — Comando do Dia (most complex)
5. TVScreen2.tsx — Performance KPIs
6. TVScreen3.tsx — Performance por Assessor
7. TVScreen4.tsx — Reconhecimento
8. TVConfig.tsx — config modal + Supabase persistence
9. Header link in Index.tsx (small button to navigate to `/tv`)
