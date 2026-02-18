

## Ajustes visuais em 4 pontos do Dashboard

### 1. Coluna "Falta" no card Planejamento
**Arquivo:** `src/components/dashboard/FlipMetaTable.tsx` (linhas 87-95)

Quando a meta for atingida, substituir o "check" atual por texto **"Atingido"** em verde. Quando faltar, manter o valor em vermelho como esta.

- Linha 90-91: trocar `<span className="text-green-400">✓</span>` por `<span className="text-green-400 text-responsive-xs font-semibold">Atingido</span>`

### 2. Relogio do ritmo ideal mais discreto nas barras de progresso
**Arquivo:** `src/components/dashboard/ProgressBar.tsx` (linhas 59-66)

Reduzir o tamanho do icone de relogio e da bolinha, tornando-os mais sutis:
- Reduzir bolinha de `w-2 h-2` para `w-1.5 h-1.5`
- Reduzir icone Clock de `w-[5px] h-[5px]` para `w-[3px] h-[3px]`
- Reduzir opacidade adicionando `opacity-60` ao container
- Reduzir linha conectora de `h-bar-responsive` para `h-[3px]`

### 3. Remover barra azul do ICM semanal no grafico de assessores
**Arquivo:** `src/components/dashboard/AssessorChart.tsx` (linhas 147-152 e 158-161)

- Remover completamente o bloco da barra azul (ICM Semanal)
- Remover o `<span>` que mostra `semanaPercentage` em azul no lado direito

### 4. Aumentar 2x o texto "Head Bruno"
**Arquivo:** `src/components/dashboard/GaugeChart.tsx` (linha 325)

- Trocar `text-responsive-3xs` por `text-responsive-sm` (aproximadamente 2x maior)
- Manter estilo dourado, negrito e caixa alta

### Resumo dos arquivos editados
- `src/components/dashboard/FlipMetaTable.tsx` - texto "Atingido" na coluna Falta
- `src/components/dashboard/ProgressBar.tsx` - relogio mais discreto
- `src/components/dashboard/AssessorChart.tsx` - remover barra e % azul semanal
- `src/components/dashboard/GaugeChart.tsx` - HEAD BRUNO 2x maior

