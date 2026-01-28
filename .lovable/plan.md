

## Plano: Mascotes e Elementos Visuais Gamificados para Sprint

### Conceito de Gamificação

Inspirado nas melhores práticas de jogos, vou adicionar **mascotes SVG animados** que reagem ao progresso de cada KPI. Os personagens serão minimalistas, profissionais e coerentes com o tema do Sprint.

---

### Mascotes por Status de Progresso

| Status | Mascote | Animação | Posição |
|--------|---------|----------|---------|
| < 50% | 🏃 Runner (correndo) | Pernas se movendo | Canto da barra |
| 50-79% | 🚴 Ciclista (pedalando) | Rodas girando | Canto da barra |
| 80-99% | 🚀 Foguete (decolando) | Chamas pulsando | Canto da barra |
| 100% | 🏆 Campeão (comemorando) | Braços levantados | Canto da barra |

---

### Componente: SprintMascot

Criar um novo componente SVG inline que renderiza o mascote apropriado:

```tsx
// src/components/dashboard/SprintMascot.tsx

interface SprintMascotProps {
  progressPercent: number;
  isCompleted: boolean;
}

export function SprintMascot({ progressPercent, isCompleted }: SprintMascotProps) {
  // Determinar qual mascote mostrar
  if (isCompleted) return <ChampionMascot />;
  if (progressPercent >= 80) return <RocketMascot />;
  if (progressPercent >= 50) return <CyclistMascot />;
  return <RunnerMascot />;
}
```

---

### Design dos Mascotes (SVG Inline)

#### 1. Runner (< 50%) - Urgência

```tsx
function RunnerMascot() {
  return (
    <svg viewBox="0 0 24 24" className="size-scale-3 text-red-400">
      {/* Boneco correndo com animação nas pernas */}
      <circle cx="12" cy="5" r="3" fill="currentColor" /> {/* Cabeça */}
      <path 
        d="M12 8v5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round"
      /> {/* Corpo */}
      <path 
        d="M12 13l-3 4M12 13l3 4" 
        stroke="currentColor" 
        strokeWidth="2"
        className="animate-runner-legs"
      /> {/* Pernas animadas */}
    </svg>
  );
}
```

#### 2. Cyclist (50-79%) - Progresso

```tsx
function CyclistMascot() {
  return (
    <svg viewBox="0 0 32 24" className="size-scale-4 text-yellow-500">
      {/* Bicicleta com rodas girando */}
      <circle 
        cx="8" cy="16" r="5" 
        stroke="currentColor" 
        fill="none"
        className="animate-spin-slow"
      />
      <circle 
        cx="24" cy="16" r="5" 
        stroke="currentColor" 
        fill="none"
        className="animate-spin-slow"
      />
      {/* Ciclista */}
      <circle cx="16" cy="6" r="3" fill="currentColor" />
      <path d="M16 9l-4 7h12l-8-7" stroke="currentColor" />
    </svg>
  );
}
```

#### 3. Rocket (80-99%) - Quase lá

```tsx
function RocketMascot() {
  return (
    <svg viewBox="0 0 24 32" className="size-scale-4 text-green-400">
      {/* Foguete com chamas animadas */}
      <path 
        d="M12 2l6 10H6z" 
        fill="currentColor"
      /> {/* Corpo */}
      <rect x="9" y="12" width="6" height="8" fill="currentColor" />
      {/* Chamas */}
      <path 
        d="M9 20l3 8 3-8" 
        fill="orange"
        className="animate-flame"
      />
    </svg>
  );
}
```

#### 4. Champion (100%) - Vitória

```tsx
function ChampionMascot() {
  return (
    <svg viewBox="0 0 24 28" className="size-scale-4 text-green-500">
      {/* Boneco comemorando */}
      <circle cx="12" cy="5" r="4" fill="currentColor" />
      <path d="M12 9v8" stroke="currentColor" strokeWidth="2" />
      {/* Braços levantados */}
      <path 
        d="M12 11l-6-4M12 11l6-4" 
        stroke="currentColor" 
        strokeWidth="2"
        className="animate-celebrate-arms"
      />
      {/* Estrelas */}
      <text x="2" y="8" fontSize="6" className="animate-twinkle">✨</text>
      <text x="20" y="8" fontSize="6" className="animate-twinkle-delayed">✨</text>
    </svg>
  );
}
```

---

### Novas Animações (tailwind.config.ts)

```typescript
keyframes: {
  // Pernas do corredor
  "runner-legs": {
    "0%, 100%": { transform: "rotate(-15deg)" },
    "50%": { transform: "rotate(15deg)" },
  },
  // Rodas da bicicleta
  "spin-slow": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  // Chamas do foguete
  "flame": {
    "0%, 100%": { opacity: "1", transform: "scaleY(1)" },
    "50%": { opacity: "0.7", transform: "scaleY(1.2)" },
  },
  // Braços comemorando
  "celebrate-arms": {
    "0%, 100%": { transform: "rotate(0deg)" },
    "25%": { transform: "rotate(-10deg)" },
    "75%": { transform: "rotate(10deg)" },
  },
  // Estrelas brilhando
  "twinkle": {
    "0%, 100%": { opacity: "1", transform: "scale(1)" },
    "50%": { opacity: "0.5", transform: "scale(1.2)" },
  },
}
```

---

### Integração no SprintKPIBar

```tsx
// Adicionar o mascote no header de cada barra
<div className="flex items-center justify-between mb-1">
  <div className="flex items-center gap-1.5">
    {/* Mascote no início */}
    <SprintMascot 
      progressPercent={progressPercentage} 
      isCompleted={isCompleted} 
    />
    <span className="font-semibold">{label}</span>
  </div>
  <span className="font-bold">{Math.round(progressPercentage)}%</span>
</div>
```

---

### Resumo das Alterações

| Arquivo | Alteração |
|---------|-----------|
| `src/components/dashboard/SprintMascot.tsx` | **NOVO** - Componente com mascotes SVG |
| `tailwind.config.ts` | Adicionar keyframes para animações dos mascotes |
| `src/components/dashboard/SprintKPIBar.tsx` | Integrar o SprintMascot no header |

---

### Resultado Visual Esperado

**Experiência gamificada**:
- Cada KPI tem um mascote que reflete seu progresso
- Animações sutis que indicam movimento/urgência
- Celebração especial quando a meta é atingida
- Visual profissional e divertido ao mesmo tempo

**Princípios de game design aplicados**:
- Feedback visual imediato
- Recompensa visual para conquistas
- Urgência visual para itens atrasados
- Progressão clara através de mascotes diferentes

