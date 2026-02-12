

## Substituir "Ritmo" por "Falta p/ Ritmo" na Analise Trimestral

### Mudanca

**Arquivo:** `src/components/dashboard/QuarterlyKPIBar.tsx`

Na secao de status do ritmo (linhas ~181-188), onde atualmente mostra:
- `Ritmo: -R$ 150K` (quando abaixo do ritmo)
- `OK` (quando atingiu)

Substituir por:
- **Falta p/ Ritmo: R$ 150K** (valor positivo, sem o sinal negativo, mostrando quanto falta)
- Manter o `OK` verde quando ja atingiu o ritmo

O valor `faltaParaRitmo` ja esta calculado no componente como `Math.max(0, valorEsperadoRitmo - value)`, entao basta ajustar o texto exibido de `Ritmo: -{valor}` para `Falta p/ Ritmo: {valor}`.

