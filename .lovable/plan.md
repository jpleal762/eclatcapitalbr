

# Plano: Otimizar PDF para Uma Pagina com Logo

## Objetivo
1. Adicionar logo Eclat XP no topo do relatorio
2. Mudar titulos das secoes de dourado para branco
3. Otimizar layout para manter tudo em uma pagina

---

## Detalhes Tecnicos

### 1. Adicionar Logo no Topo

**Abordagem**: Usar o arquivo PNG existente (`src/assets/eclat-xp-logo-dark.png`) e converte-lo para base64 para embedding no PDF.

```typescript
// Importar logo como base64
import eclatLogoDark from "@/assets/eclat-xp-logo-dark.png";

// No PDF, adicionar a imagem no topo
doc.addImage(eclatLogoDark, "PNG", 14, 10, 50, 12);
```

**Posicao**: Canto superior esquerdo, antes do titulo do relatorio.

### 2. Titulos das Secoes em Branco

**Alteracoes**:
- "INDICADORES GERAIS" → COLORS.text (branco)
- "PLANEJAMENTO SEMANAL ACUMULADO" → COLORS.text (branco)
- "METAS MENSAIS (KPIs)" → COLORS.text (branco)
- "PERFORMANCE POR ASSESSOR" → COLORS.text (branco)

```typescript
// Antes (dourado)
doc.setTextColor(...COLORS.gold);
doc.text("INDICADORES GERAIS", 14, 58);

// Depois (branco)
doc.setTextColor(...COLORS.text);
doc.text("INDICADORES GERAIS", 14, 58);
```

### 3. Otimizar Layout para Uma Pagina

**Estrategias de compactacao**:

| Elemento | Antes | Depois |
|----------|-------|--------|
| Fonte das tabelas | 9px | 8px |
| Cell padding | 3px | 2px |
| Espaco entre secoes | 15-20px | 8-10px |
| Fonte indicadores | 11px | 10px |
| Titulo principal | 18px | 16px |
| Subtitulos | 14px | 12px |

**Layout compacto proposto**:
```
+------------------------------------------+
| [LOGO]  RELATORIO SEMANAL DE KPIs        | Y: 10-28
|         Visao | Periodo | Data           |
+------------------------------------------+
| INDICADORES GERAIS                       | Y: 35-45
| ICM | Ritmo | Dias                       |
+------------------------------------------+
| PLANEJAMENTO SEMANAL ACUMULADO           | Y: 50-100
| [Tabela compacta - 4 linhas]             |
+------------------------------------------+
| METAS MENSAIS (KPIs)                     | Y: 105-180
| [Tabela compacta - 9 linhas]             |
+------------------------------------------+
| PERFORMANCE POR ASSESSOR (se escritorio) | Y: 185-270
| [Tabela compacta - 7 linhas]             |
+------------------------------------------+
```

### 4. Remover Logica de Nova Pagina

Como o objetivo e manter tudo em uma pagina, remover a verificacao `if (finalY2 + 50 > doc.internal.pageSize.height)` que adiciona nova pagina.

---

## Arquivo a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/reportUtils.ts` | Adicionar logo, mudar cor titulos, compactar layout |

---

## Resumo das Alteracoes em reportUtils.ts

1. Importar o logo PNG
2. Ajustar posicionamento Y para acomodar logo no topo
3. Trocar `COLORS.gold` por `COLORS.text` nos titulos de secao
4. Reduzir fontSize em todos os elementos
5. Reduzir cellPadding nas tabelas
6. Reduzir espacamento entre secoes
7. Manter headers das tabelas em dourado (identidade visual)
8. Remover logica de adicionar nova pagina

