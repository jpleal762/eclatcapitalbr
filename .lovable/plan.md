
## Two Features: Weekly Variation in Ranking + Kiosk Mode

### Feature 1: Weekly Variation in Screen 1 Ranking

**What we have:** `AssessorPerformance` already contains `semanaPercentage` (ICM semanal calculated from `calculateICMSemanal`). The current ranking card shows only `geralPercentage`.

**What to add:**
1. **Weekly delta badge** — `semanaPercentage - geralPercentage` shows the differential between weekly pace and overall pace. Display as `+2pp` / `-1pp` in a small colored badge (green up / red down / gray neutral).
2. **Ranking arrow** — Compare current ranking position (by `geralPercentage`) vs ranking-by-`semanaPercentage` order to infer if the assessor is trending up or down. Arrow: `ArrowUp` (green) if their weekly rank is higher than their overall rank, `ArrowDown` (red) if lower, nothing if same.

**Logic:**
```
// Weekly delta
const weeklyDelta = a.semanaPercentage - a.geralPercentage;

// Ranking trend: compare overall rank idx vs weekly rank
const weeklyRank = [...assessorPerformance]
  .sort((x, y) => y.semanaPercentage - x.semanaPercentage)
  .findIndex(x => x.fullName === a.fullName);
const trendUp = weeklyRank < idx;   // lower index = better rank
const trendDown = weeklyRank > idx;
```

**UI changes in `TVScreen1.tsx`** — ranking row gains two new inline elements:
- Small arrow icon (`ArrowUp`/`ArrowDown`) to the left of the name
- `+Xpp` / `-Xpp` badge to the right of the `%` value

---

### Feature 2: Kiosk Mode (30s inactivity → immersive)

**Logic:** In `TVDashboard.tsx`, track mouse movement + keyboard activity. After 30 seconds of no interaction, set `isKiosk = true`. Any activity resets it back.

**What happens in kiosk mode:**
- `TVLayout` receives `isKiosk` prop
- Header and footer get `opacity-0 pointer-events-none h-0 overflow-hidden` transition (CSS transition for smooth hide)
- The `<main>` content area expands to full height (`h-screen` instead of `flex-1`)
- A subtle "touch to exit kiosk" pill appears at the bottom edge, barely visible (opacity 10%), that resets inactivity on click

**Implementation:**
- `TVDashboard.tsx`: add `isKiosk` state + `useEffect` with `resetTimer` callback on `mousemove`, `keydown`, `touchstart` events
- `TVLayout.tsx`: accept `isKiosk?: boolean` prop, apply conditional classes on header/footer, animate with `transition-all duration-700`

**No new files needed** — only changes to `TVDashboard.tsx` and `TVLayout.tsx` (and `TVScreen1.tsx` for ranking).

---

### Files to change:
1. `src/components/tv/TVScreen1.tsx` — add weekly delta badge + ranking trend arrow to each row
2. `src/pages/TVDashboard.tsx` — add 30s inactivity detection → `isKiosk` state, pass to TVLayout
3. `src/components/tv/TVLayout.tsx` — accept `isKiosk` prop, hide header/footer with smooth transition when active, show subtle exit hint
