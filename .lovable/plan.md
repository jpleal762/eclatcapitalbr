

# Plano: Corrigir Build e Melhorar Visual do PDF

## Objetivo
1. Corrigir os erros de build (xlsx e @import)
2. Aplicar identidade visual dark theme no PDF
3. Destacar em vermelho itens abaixo do ritmo ideal

---

## Parte 1: Correção de Erros de Build

### Erro 1: Import xlsx em kpiUtils.ts
O arquivo `kpiUtils.ts` ainda importa `xlsx` (linha 2), mas a dependência foi removida.

**Solução**: Verificar se xlsx ainda é usado em kpiUtils.ts. Se for usado apenas para parse de arquivos, manter. Caso contrário, remover o import.

### Erro 2: @import deve vir antes de @tailwind
O CSS exige que `@import` venha antes de qualquer outra declaração.

**Solução**: Mover os imports de fontes para o topo do arquivo `index.css`.

---

## Parte 2: Visual do PDF - Dark Theme

### Cores da Identidade Éclat XP (Dark Mode)
| Elemento | Cor |
|----------|-----|
| Background | #1a1a1a (dark) |
| Texto Principal | #f5f5f5 (light) |
| Headers | Gold Gradient (#FFE066 → #E6A800) |
| Acento | Gold (#D4A000) |
| Abaixo do Ritmo | Vermelho (#DC2626) |

### Estrutura Visual do PDF

```
+------------------------------------------+
| [FUNDO ESCURO #1a1a1a]                   |
|                                          |
| ██ RELATÓRIO SEMANAL DE KPIs ██          |
|    (Texto dourado #D4A000)               |
|                                          |
| Visão: Escritório Eclat (texto claro)    |
| Período: FEV-26                          |
|                                          |
| ┌──────────────────────────────────────┐ |
| │ INDICADORES GERAIS                   │ |
| │ (Header com gradiente dourado)       │ |
| ├──────────────────────────────────────┤ |
| │ ICM Geral: 85%   Ritmo Ideal: 45%    │ |
| │ (Se ICM < Ritmo = VERMELHO)          │ |
| └──────────────────────────────────────┘ |
|                                          |
| ┌──────────────────────────────────────┐ |
| │ PLANEJAMENTO SEMANAL                 │ |
| │ (Header dourado)                     │ |
| ├──────────────────────────────────────┤ |
| │ Captação | R$500K | R$320K | 64% ❌  │ |
| │ Receita  | R$25K  | R$30K  | 120% ✓  │ |
| │ (Linhas abaixo ritmo = vermelho)     │ |
| └──────────────────────────────────────┘ |
+------------------------------------------+
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/index.css` | Mover @imports para o topo (antes de @tailwind) |
| `src/lib/kpiUtils.ts` | Reinstalar xlsx pois é usado para parse de arquivos |
| `src/lib/reportUtils.ts` | Aplicar dark theme e cores condicionais |

---

## Detalhes da Implementação do PDF

### 1. Background e Página
```typescript
// Aplicar fundo escuro em toda a página
doc.setFillColor(26, 26, 26); // #1a1a1a
doc.rect(0, 0, 210, 297, "F");
```

### 2. Título com Cor Dourada
```typescript
doc.setTextColor(212, 160, 0); // Gold #D4A000
doc.setFontSize(18);
doc.text("RELATÓRIO SEMANAL DE KPIs", 14, 20);
```

### 3. Headers das Tabelas
```typescript
headStyles: {
  fillColor: [212, 160, 0], // Gold
  textColor: [26, 26, 26],  // Dark text on gold
  fontStyle: "bold"
}
```

### 4. Linhas Condicionais (Vermelho se abaixo do ritmo)
```typescript
didParseCell: (data) => {
  if (data.section === 'body') {
    const percentage = parseFloat(data.row.raw[3]); // coluna %
    if (percentage < ritmoIdeal) {
      data.cell.styles.textColor = [220, 38, 38]; // Red
    }
  }
}
```

### 5. Corpo da Tabela com Fundo Escuro
```typescript
styles: {
  fillColor: [38, 38, 38],  // #262626 - slightly lighter than bg
  textColor: [245, 245, 245], // Light text
}
alternateRowStyles: {
  fillColor: [51, 51, 51],  // #333333 - alternate rows
}
```

---

## Resultado Esperado

- PDF com fundo escuro (#1a1a1a)
- Texto principal em branco/claro
- Headers dourados (identidade Éclat)
- KPIs abaixo do ritmo em vermelho
- Visual consistente com o dashboard dark mode

