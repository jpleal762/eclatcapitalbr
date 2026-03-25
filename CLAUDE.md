# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development server (Vite)
npm run build      # Production build
npm run build:dev  # Development build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

There is no test suite configured in this project.

## Architecture Overview

**Eclat Capital XP** is a KPI tracking dashboard for a financial services firm, supporting web, mobile, and TV kiosk display modes.

### Data Flow

Raw Excel upload → `parseXLSXFile()` → `KPIRecord[]` → `processKPIData()` → `ProcessedKPI` → `processDashboardData()` → `DashboardData` rendered by components.

All KPI calculation logic lives in `src/lib/`:
- `kpiUtils.ts` (1470 lines) — core calculations, the main source of truth for metrics
- `yearlyKpiUtils.ts` — yearly aggregations
- `quarterlyKpiUtils.ts` — quarterly calculations
- `evolutionUtils.ts` — sprint/evolution metrics

### Persistence: Local-First + Supabase Sync

Data is loaded from Excel into `localStorage` first, then synced to Supabase. Previous states are snapshotted before replacement to enable evolution tracking. `src/lib/storage.ts` manages this hybrid pattern.

### State Management

- **ScaleContext** (`src/contexts/ScaleContext.tsx`) — global UI scaling; applies a `--scale-factor` CSS custom property across the entire app. Supports auto (viewport-based), manual (1×–2×), and TV mode (4K/QHD/FHD).
- **TanStack React Query** — Supabase data fetching and caching.
- **localStorage** — dashboard visibility, sprint selection, assessor token, scale factor, theme.

### Authentication

Token-based assessor auth. Token stored in `localStorage` under `eclat:pwa:token` and injected into Supabase requests as an `x-assessor-token` header. See `src/lib/auth.ts` and `src/integrations/supabase/authedClient.ts`. Month-level access control is enforced via `src/lib/permissions.ts`.

### Routing

Single-page app with React Router v6:
- `/` — Main dashboard (`src/pages/Index.tsx`)
- `/tv` — TV kiosk mode (`src/pages/TVDashboard.tsx`)

### TV / Kiosk Mode

`TVDashboard.tsx` rotates through 6 screens (`src/components/tv/TVScreen1–6`) on intervals (20/12/12/8/15/15 seconds). Data refreshes every 5 minutes. TV mode has its own scaling via `useTVScale.ts`.

### PWA

Vite-plugin-pwa with custom caching: Network-only for HTML, Network-first (3s timeout) for JS/CSS, Cache-first for images/fonts. SW update polling every 30 seconds; all tabs reload via `BroadcastChannel` on update.

### Key Patterns

- `src/components/dashboard/` — 35+ presentational components (ICMCard, GaugeChart, MetaTable, etc.). "Flip" variants (FlipICMCard, FlipGaugeChart) add transition animations.
- `src/components/ui/` — shadcn/ui base components; do not modify directly.
- `src/types/kpi.ts` — all shared TypeScript interfaces.
- TypeScript is configured leniently (`noImplicitAny: false`, `strictNullChecks: false`).
- Excel file validation uses Zod schemas with security checks for prototype pollution (`__proto__`, `constructor`, `prototype`). Max file size: 10 MB.
- Exports supported: XLSX (ExcelJS) and PDF (jsPDF) via `src/lib/exportUtils.ts`.
