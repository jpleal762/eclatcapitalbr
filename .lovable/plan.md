

## Historico de Uploads para Analise de Evolucao (7 dias)

### Problema atual
Cada upload de Excel **substitui** todos os dados anteriores na tabela `kpi_records`. Nao ha historico, impossibilitando comparacoes temporais.

### Solucao

Criar um sistema de snapshots completos que salva automaticamente uma copia dos dados a cada upload, permitindo comparar o estado atual com uploads anteriores.

### 1. Nova tabela no banco de dados

Criar tabela `kpi_snapshots` para armazenar historico:

| Coluna | Tipo | Descricao |
|--------|------|-----------|
| id | uuid | Chave primaria |
| created_at | timestamptz | Momento do upload |
| created_by | text | Quem fez o upload |
| snapshot_data | jsonb | Dados completos (todos os KPI records) |
| month | text | Mes de referencia do upload |
| record_count | integer | Quantidade de registros |

Politicas RLS: leitura e insercao publicas, delete publico (para limpeza). Retencao: manter apenas os ultimos 30 snapshots para nao acumular dados indefinidamente.

### 2. Logica de salvamento automatico

No `src/lib/storage.ts`, adicionar funcao `saveKPISnapshot()` que sera chamada automaticamente dentro de `saveExcelData()` **antes** de deletar os dados antigos. Assim, cada upload gera um snapshot do estado atual.

### 3. Funcoes de consulta de evolucao

Criar `src/lib/evolutionUtils.ts` com:

- `getSnapshotFromDaysAgo(days: number)` - busca o snapshot mais proximo de N dias atras
- `calculateKPIEvolution(currentData, previousSnapshot, month)` - calcula a diferenca de "Realizado" por KPI entre dois pontos no tempo
- Retorna por assessor e por categoria: quanto foi realizado no periodo

### 4. Componente de visualizacao

Criar um card ou secao na pagina de Analise (ou Dashboard) mostrando:

- **Evolucao 7 dias** por KPI: valor realizado agora vs. 7 dias atras
- Delta absoluto e percentual
- Indicador visual (seta verde para cima, vermelha para baixo)
- Possibilidade de ver por assessor individual

### Detalhes tecnicos

```text
Fluxo do upload:
  Usuario sobe XLSX
    -> saveExcelData() e chamado
      -> ANTES de deletar, salva snapshot do estado atual
      -> Deleta dados antigos
      -> Insere dados novos
      -> Salva snapshot dos dados novos tambem
    -> Dashboard atualiza

Fluxo de consulta:
  Pagina de Analise carrega
    -> getSnapshotFromDaysAgo(7) busca snapshot ~7 dias atras
    -> calculateKPIEvolution() compara com dados atuais
    -> Exibe deltas por KPI
```

### Arquivos envolvidos

- **Novo:** Migration SQL para tabela `kpi_snapshots`
- **Novo:** `src/lib/evolutionUtils.ts` (funcoes de calculo de evolucao)
- **Editado:** `src/lib/storage.ts` (adicionar salvamento de snapshot no upload)
- **Editado:** `src/pages/Index.tsx` (carregar dados de evolucao)
- **Editado:** Pagina de analise ou dashboard (exibir card de evolucao 7 dias)

