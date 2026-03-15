
## Analysis

The TV dashboard screens use many **fixed pixel values via hardcoded Tailwind classes**: `text-xs`, `text-sm`, `text-base`, `text-xl`, `text-2xl`, `w-[220px]`, `grid-cols-[200px_1fr_...]`, `h-3`, `h-4`, `w-8 h-8`, etc. These don't adapt to different TV resolutions (55" 1080p vs 55" 4K vs 42" 1080p). The `useResponsiveSize` hook already exists and calculates a `scale` ratio from actual viewport vs 1600x900 baseline.

The fix: use a **CSS `transform: scale()` + viewport units approach** on the TV route. The entire TV content area gets scaled by the viewport ratio, making everything — text, spacing, icons, bars — automatically fill the screen proportionally. This is far simpler than converting every class to fluid units.

## Strategy: CSS Scale Transform on TV Content Wrapper

The `TVDashboard.tsx` wraps the screen content in a single div. Instead of changing every component, we'll:

1. **Create a `useTVScale` hook** that computes `scale = Math.min(vw/1920, vh/1080)` — scaled against 1920x1080 as TV base reference (instead of 1600x900, since TVs are 1920+ wide). This is a better TV baseline.

2. **Apply `transform: scale(scale)` on the inner content wrapper** with `transform-origin: top left` and explicitly set `width/height = 100/scale %` to compensate for the transform not affecting layout flow.

3. **The header/footer in TVLayout** also needs to scale. The cleanest approach: wrap the ENTIRE `TVLayout` output in a scale container, or better, add the scale to a root wrapper in `TVDashboard.tsx` using a CSS custom property (`--tv-scale`) and apply it via inline style on the outermost TV div.

4. **Fixed grid column widths** in Screen2/3 (e.g., `grid-cols-[200px_1fr_80px_130px_130px_130px]`) will not scale with transform — but since we're scaling the WHOLE layout via transform, they will visually scale correctly.

## Implementation Plan

### New file: `src/hooks/useTVScale.ts`
```ts
// Calculates scale factor relative to 1920x1080 TV baseline
// Returns: { scale, cssScale }
// scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
// Clamps between 0.5 and 2.0
```

### Modify: `src/pages/TVDashboard.tsx`
- Import `useTVScale`
- Wrap the entire render output in a `div` with:
  ```html
  <div style={{ 
    transform: `scale(${scale})`, 
    transformOrigin: 'top left',
    width: `${100 / scale}%`,
    height: `${100 / scale}%`
  }}>
  ```
- Pass `scale` down as a prop or context so components can be aware if needed

### Modify: `src/components/tv/TVLayout.tsx`
- The outer `h-screen w-screen` container stays unchanged (fills the TV)
- No changes needed — the outer wrapper handles scaling

### Modify: `src/components/tv/TVScreen1.tsx`, `TVScreen2.tsx`, `TVScreen3.tsx`, `TVScreen4.tsx`
- These render inside the scaled wrapper, so no changes needed for the scale itself
- BUT: bump up base font sizes and spacings slightly since we're now targeting 1920x1080 as baseline:
  - Screen1: `text-xs` → `text-sm`, `text-sm` → `text-base`, `text-2xl` → `text-3xl` for StatusChip values, `w-[220px]` → `w-[260px]`
  - Screen2: `text-sm` → `text-base` for row labels, `text-base` → `text-lg` for percentages, column widths from `200px/80px/130px` → `220px/90px/150px`
  - Screen3: column widths `180px/80px` → `200px/90px`, font sizes up one step
  - Screen4: `text-2xl` → `text-3xl` for names in RecognitionCard, icons `w-8 h-8` → `w-10 h-10`
  - TVLayout header/footer: `text-xs` → `text-sm`, icons `w-4 h-4` → `w-5 h-5`, logo `h-7` → `h-9`, font sizes up

### Add: Fullscreen button in `TVLayout`
Since the user wants to fill the TV, add a `Maximize2` / `Minimize2` button to the header that calls `document.documentElement.requestFullscreen()` — this ensures actual browser fullscreen on the TV.

### Result
- On a 1920x1080 TV: `scale = 1.0` — content fills perfectly
- On a 3840x2160 (4K): `scale = 2.0` — everything doubles in size
- On a 1366x768 laptop: `scale ≈ 0.71` — shrinks to fit
- On the Lovable preview (923x841): `scale ≈ 0.78` — compact but readable

### Files to change:
1. **NEW** `src/hooks/useTVScale.ts` — scale calculation hook
2. `src/pages/TVDashboard.tsx` — apply scale transform wrapper + fullscreen button trigger
3. `src/components/tv/TVLayout.tsx` — bump base sizes, add fullscreen button
4. `src/components/tv/TVScreen1.tsx` — bump base sizes for 1920 baseline
5. `src/components/tv/TVScreen2.tsx` — bump base sizes + column widths
6. `src/components/tv/TVScreen3.tsx` — bump base sizes + column widths
7. `src/components/tv/TVScreen4.tsx` — bump base sizes, larger names/icons
