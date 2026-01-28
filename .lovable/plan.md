

## Plano: Aplicar Escala Global em Todas as Telas

### Problema

- **Dashboard**: Usa classes responsivas (`text-responsive-xs`) que multiplicam por `--scale-factor` ✓
- **Análises/Sprint**: Usam tamanhos fixos (`text-[12px]`, `text-[6px]`) que NÃO escalam ✗

### Solução

Substituir todos os tamanhos fixos por classes responsivas que reagem ao `--scale-factor`.

---

### Novas Classes CSS (index.css)

Adicionar classes para os tamanhos específicos usados nas telas Sprint e Análises:

| Classe Nova | Fórmula | Base (1x) | Com 1.75x |
|-------------|---------|-----------|-----------|
| `.text-scale-3` | `calc(3px * var(--scale-factor))` | 3px | 5.25px |
| `.text-scale-4` | `calc(4px * var(--scale-factor))` | 4px | 7px |
| `.text-scale-5` | `calc(5px * var(--scale-factor))` | 5px | 8.75px |
| `.text-scale-6` | `calc(6px * var(--scale-factor))` | 6px | 10.5px |
| `.text-scale-7` | `calc(7px * var(--scale-factor))` | 7px | 12.25px |
| `.text-scale-8` | `calc(8px * var(--scale-factor))` | 8px | 14px |
| `.text-scale-9` | `calc(9px * var(--scale-factor))` | 9px | 15.75px |
| `.text-scale-10` | `calc(10px * var(--scale-factor))` | 10px | 17.5px |
| `.text-scale-12` | `calc(12px * var(--scale-factor))` | 12px | 21px |
| `.text-scale-14` | `calc(14px * var(--scale-factor))` | 14px | 24.5px |
| `.text-scale-16` | `calc(16px * var(--scale-factor))` | 16px | 28px |

Classes para dimensões de ícones e elementos:

| Classe Nova | Fórmula |
|-------------|---------|
| `.size-scale-1` | `calc(4px * var(--scale-factor))` |
| `.size-scale-1.5` | `calc(6px * var(--scale-factor))` |
| `.size-scale-2` | `calc(8px * var(--scale-factor))` |
| `.size-scale-2.5` | `calc(10px * var(--scale-factor))` |
| `.size-scale-3` | `calc(12px * var(--scale-factor))` |
| `.size-scale-4` | `calc(16px * var(--scale-factor))` |
| `.h-scale-4` | `calc(16px * var(--scale-factor))` |
| `.h-scale-6` | `calc(24px * var(--scale-factor))` |
| `.w-scale-[Xpx]` | `calc(Xpx * var(--scale-factor))` |

---

### Arquivos a Modificar

#### 1. `src/index.css`
- Adicionar todas as classes `.text-scale-*` e `.size-scale-*`

#### 2. `src/components/dashboard/AnalysisPage.tsx`

| Antes | Depois |
|-------|--------|
| `text-[9px]` | `text-scale-9` |
| `text-[7px]` | `text-scale-7` |
| `text-[6px]` | `text-scale-6` |
| `text-[5px]` | `text-scale-5` |
| `text-[10px]` | `text-scale-10` |
| `h-4` (Select) | `h-scale-4` |
| `h-2 w-2` (Icons) | Classes inline com calc |

#### 3. `src/components/dashboard/QuarterlyKPIBar.tsx`

| Antes | Depois |
|-------|--------|
| `text-[5px] lg:text-[6px]` | `text-scale-5 lg:text-scale-6` |
| `text-[4px] lg:text-[5px]` | `text-scale-4 lg:text-scale-5` |
| `text-[6px] lg:text-[7px]` | `text-scale-6 lg:text-scale-7` |
| `h-1 lg:h-1.5` | Classes com calc |

#### 4. `src/components/dashboard/SprintPage.tsx`

| Antes | Depois |
|-------|--------|
| `text-[10px] lg:text-[12px]` | `text-scale-10 lg:text-scale-12` |
| `text-[12px] lg:text-[14px]` | `text-scale-12 lg:text-scale-14` |
| `h-3 w-3 lg:h-4 lg:w-4` | Classes com calc |
| `h-6` (Select) | `h-scale-6` |

#### 5. `src/components/dashboard/SprintKPIBar.tsx`

| Antes | Depois |
|-------|--------|
| `text-[12px] lg:text-[14px]` | `text-scale-12 lg:text-scale-14` |
| `text-[14px] lg:text-[16px]` | `text-scale-14 lg:text-scale-16` |
| `text-[10px]` | `text-scale-10` |
| `h-3 lg:h-4` | Classes com calc |
| `h-3 w-3 lg:h-4 lg:w-4` | Classes com calc |

---

### Exemplo de Implementação

**CSS (index.css)**:
```css
/* Scaled text sizes that respond to --scale-factor */
.text-scale-3 { font-size: calc(3px * var(--scale-factor)); }
.text-scale-4 { font-size: calc(4px * var(--scale-factor)); }
.text-scale-5 { font-size: calc(5px * var(--scale-factor)); }
.text-scale-6 { font-size: calc(6px * var(--scale-factor)); }
.text-scale-7 { font-size: calc(7px * var(--scale-factor)); }
.text-scale-8 { font-size: calc(8px * var(--scale-factor)); }
.text-scale-9 { font-size: calc(9px * var(--scale-factor)); }
.text-scale-10 { font-size: calc(10px * var(--scale-factor)); }
.text-scale-12 { font-size: calc(12px * var(--scale-factor)); }
.text-scale-14 { font-size: calc(14px * var(--scale-factor)); }
.text-scale-16 { font-size: calc(16px * var(--scale-factor)); }
```

**Componente (SprintKPIBar.tsx)**:
```tsx
// ANTES
<span className="text-[12px] lg:text-[14px] font-semibold">

// DEPOIS
<span className="text-scale-12 lg:text-scale-14 font-semibold">
```

---

### Resultado Esperado

Quando o usuário seleciona uma escala no dropdown:

| Escala | Dashboard | Análises | Sprint |
|--------|-----------|----------|--------|
| 1x | ✓ | ✓ | ✓ |
| 1.25x | ✓ | ✓ | ✓ |
| 1.5x | ✓ | ✓ | ✓ |
| 1.75x | ✓ | ✓ | ✓ |
| 2x | ✓ | ✓ | ✓ |

Todas as 3 telas escalarão proporcionalmente conforme a seleção.

