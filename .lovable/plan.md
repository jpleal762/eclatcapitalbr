
# Plano: Layout Primeiras Reunioes + Correcao de bugs de edicao

## 1. Primeiras Reunioes ocupa espaco total com AgendadasCard atras (flip)

**Arquivo:** `src/pages/Index.tsx` (linhas 854-883)

Substituir os dois containers separados (AgendadasCard + GaugeChart Primeiras Reunioes) por um unico componente FlipGaugeChart que ocupa todo o espaco do card3.

- **Frente:** Gauge de Primeiras Reunioes (como esta hoje, com barra secundaria de Agendadas)
- **Verso:** AgendadasCard (lista de reunioes agendadas por assessor)

Sera necessario criar uma versao do flip que mostra o AgendadasCard no verso em vez da lista padrao. Para simplificar, usaremos a estrutura de flip manual com CSS, similar ao FlipGaugeChart existente, mas com o AgendadasCard como conteudo do verso.

## 2. Corrigir bug: Captacao NET diz "nao existe"

**Arquivo:** `src/pages/Index.tsx` (linha 369)

O mapeamento `GAUGE_CATEGORY_MAP` tem `"Captacao net"` (sem acento), mas no banco de dados a categoria e `"Captação net"` (com acento no "a"). O modal de edicao faz `.eq("categorias", filterCategory)` e nao encontra nada.

**Correcao:** Trocar `"Captacao net"` por `"Captação net"` no mapa.

## 3. Corrigir bug: PJ2 XP mostra zero

**Arquivo:** `src/pages/Index.tsx` (linha 376)

O gauge de PJ2 XP mostra a soma de `PJ2 XP` + `Receita Empilhada` (Realizado), mas o modal de edicao filtra apenas por `categorias = 'PJ2 XP'`, e a maioria dos assessores tem valor nulo nessa categoria. Os valores reais estao em `Receita Empilhada`.

**Correcao:** O modal de edicao para PJ2 XP deve incluir ambas as categorias. Mudar `GAUGE_CATEGORY_MAP[6]` para passar ambas as categorias, ou alterar o `ProductionEditModal` para aceitar multiplas categorias.

Abordagem escolhida: Modificar `ProductionEditModal` para aceitar `filterCategory` como string ou array, e quando for PJ2 XP, passar `["PJ2 XP", "Receita Empilhada"]`. No modal, usar `.in("categorias", [...])` em vez de `.eq()`.

---

## Resumo de alteracoes

| Arquivo | Alteracao |
|---------|-----------|
| `src/pages/Index.tsx` | (1) Substituir AgendadasCard + Primeiras Reunioes por flip card unico; (2) Corrigir acento em "Captação net"; (3) Passar array de categorias para PJ2 XP |
| `src/components/dashboard/ProductionEditModal.tsx` | Aceitar `filterCategory` como `string \| string[] \| null` e usar `.in()` quando for array |

## Detalhes tecnicos

### Flip card Primeiras Reunioes (Index.tsx, linhas 853-883)

```text
Antes:
+------------------+
| AgendadasCard    |  flex-1
+------------------+
| Primeiras Reunioes| flex-1
+------------------+

Depois:
+------------------+
|  [FLIP CARD]     |  ocupa todo espaco
|  Frente: Gauge   |
|  Verso: Agendadas|
+------------------+
```

Implementar usando o mesmo padrao de flip CSS do FlipGaugeChart: container com `perspective`, face frontal com GaugeChart e face traseira com AgendadasCard, controlado pelo `isGlobalFlipped`.

### ProductionEditModal (filterCategory)

Alterar a interface para aceitar `filterCategory?: string | string[] | null`. Na query:
- Se for string: `.eq("categorias", filterCategory)`
- Se for array: `.in("categorias", filterCategory)`

### GAUGE_CATEGORY_MAP correcoes

```
0: "Captação net"    // acento corrigido
6: ["PJ2 XP", "Receita Empilhada"]  // ou manter string e tratar no handler
```

Para PJ2 XP, o handler passara as categorias como array:
```typescript
onEditProduction={() => {
  setProductionEditCategory(["PJ2 XP", "Receita Empilhada"]);
  setIsProductionEditOpen(true);
}}
```

Isso requer tambem ajustar o state `productionEditCategory` para aceitar `string | string[] | null`.
