
# Plano: Auto-Ajuste de Escala para Tela

## Objetivo
Ajustar automaticamente a escala do dashboard ao abrir para que todo o conteúdo caiba na tela sem sobreposição de dados e sem alterar o layout existente.

## Resumo da Solução
Implementar detecção automática do tamanho da tela e calcular um fator de escala ideal que garanta que todos os elementos do dashboard sejam visíveis sem scroll ou sobreposição.

---

## Detalhes Técnicos

### 1. Modificar ScaleContext.tsx

Adicionar lógica de auto-escala inicial:

```typescript
// Calcular escala ideal baseado no viewport
const calculateOptimalScale = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Dimensões de referência do dashboard (1600x900 - design base)
  const baseWidth = 1600;
  const baseHeight = 900;
  
  // Calcular escala para caber na tela
  const scaleX = width / baseWidth;
  const scaleY = height / baseHeight;
  
  // Usar o menor para garantir que caiba em ambas dimensões
  const optimalScale = Math.min(scaleX, scaleY);
  
  // Limitar entre 0.8 e 2.0 para manter legibilidade
  return Math.max(0.8, Math.min(2.0, optimalScale));
};
```

### 2. Nova Lógica de Inicialização

- Na primeira carga (sem escala salva), calcular automaticamente
- Arredondar para valores válidos (1, 1.25, 1.5, 1.75, 2)
- Respeitar escala salva se usuário já escolheu manualmente

### 3. Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/ScaleContext.tsx` | Adicionar `calculateOptimalScale()` e aplicar na inicialização |
| `src/components/ScaleSelector.tsx` | Adicionar opção "Auto" que recalcula |

### 4. Comportamento Esperado

1. **Primeira Visita**: Dashboard calcula escala ideal automaticamente
2. **Visitas Subsequentes**: Usa escala salva no localStorage
3. **Opção Manual**: Usuário pode ajustar via ScaleSelector (override)
4. **Opção "Auto"**: Nova opção para recalcular escala ideal

### 5. Fluxo de Decisão

```
Ao carregar o dashboard:
├── Tem escala salva no localStorage?
│   ├── SIM → Usar escala salva
│   └── NÃO → Calcular escala ideal automaticamente
│       └── Arredondar para valor válido mais próximo
│           └── Aplicar e salvar
```

---

## Resultado Esperado

- Dashboard sempre abre ajustado para a tela atual
- Sem scroll horizontal ou vertical em desktop/TV
- Sem sobreposição de cards ou dados
- Layout permanece inalterado (apenas escala proporcionalmente)
- Usuário pode ajustar manualmente se preferir
