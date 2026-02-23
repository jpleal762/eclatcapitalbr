

## Avatares Cartoon por Assessor no Sprint

### Objetivo
Substituir os mascotes de progresso (Runner, Cyclist, Rocket, Champion) nos cards de assessor por desenhos cartoon personalizados para cada pessoa da equipe.

### Personagens
- **Jose** - Menino branco, cabelo preto
- **Marcela** - Menina morena/jambo, cabelo preto
- **Hingrid** - Mulher loira
- **Romulo** - Homem, cabelo preto
- **Ona** - Mulher, cabelo preto

### Mudancas

**Novo componente: `src/components/dashboard/AssessorAvatar.tsx`**
- SVGs inline desenhados a mao com estilo cartoon simplificado (rosto redondo, olhos, sorriso, cabelo estilizado)
- Cada personagem com cores de pele e cabelo correspondentes
- Componente recebe `assessorName` e renderiza o avatar correto (match pelo primeiro nome, case-insensitive)
- Fallback generico para nomes nao mapeados (silhueta neutra com inicial)
- Tamanho responsivo via props de className

**Editar: `src/components/dashboard/SprintAssessorCard.tsx`**
- Substituir `<SprintMascot>` por `<AssessorAvatar>` no header do card
- Passar `assessorName` ao inves de `progressPercent`/`isCompleted`
- Manter o SprintMascot no `SprintChallengeSummary` (card geral continua com mascote de progresso)

### Detalhes tecnicos

Cada avatar sera um SVG com viewBox padrao, usando formas simples:
- Circulo para rosto com cor de pele adequada
- Paths para cabelo com cor e estilo especifico
- Olhos (circulos escuros) e sorriso (path curvo)
- Sem dependencias externas, tudo inline SVG

O mapeamento de nomes usa o primeiro nome do assessor (split por espaco), entao "Jose Silva" vai casar com o avatar "jose".

