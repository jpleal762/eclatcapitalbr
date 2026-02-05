
# Plano: Exibir Data/Hora da Ultima Atualizacao

## Objetivo
Mostrar abaixo do botao "Atualizar dados" a data e hora da ultima vez que os dados foram carregados/atualizados.

---

## Alteracoes

### 1. `src/lib/storage.ts`

Criar nova funcao para obter o timestamp da ultima atualizacao:

```typescript
export async function getLastUpdateTimestamp(): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('kpi_records')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return null;
    return data.updated_at;
  } catch {
    return null;
  }
}
```

### 2. `src/pages/Index.tsx`

- Adicionar estado para armazenar o timestamp:
```typescript
const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
```

- Importar a nova funcao `getLastUpdateTimestamp`

- Atualizar `loadStoredData` para carregar o timestamp:
```typescript
const loadStoredData = async () => {
  // ... codigo existente ...
  const timestamp = await getLastUpdateTimestamp();
  setLastUpdateTime(timestamp);
};
```

- Atualizar `handleDataLoaded` para atualizar o timestamp apos upload:
```typescript
const handleDataLoaded = async (data: KPIRecord[]) => {
  // ... codigo existente ...
  setLastUpdateTime(new Date().toISOString());
};
```

- Passar o timestamp para o FileUpload:
```typescript
<FileUpload 
  onDataLoaded={handleDataLoaded} 
  compact 
  lastUpdate={lastUpdateTime}
/>
```

### 3. `src/components/dashboard/FileUpload.tsx`

- Adicionar prop `lastUpdate`:
```typescript
interface FileUploadProps {
  onDataLoaded: (data: KPIRecord[]) => void;
  compact?: boolean;
  lastUpdate?: string | null;
}
```

- No modo compact, exibir o timestamp abaixo do botao:
```typescript
if (compact) {
  return (
    <div className="relative flex flex-col items-center">
      <input ... />
      <Button ...>Atualizar dados</Button>
      {lastUpdate && (
        <span className="text-[8px] text-muted-foreground mt-1">
          Atualizado: {new Date(lastUpdate).toLocaleString('pt-BR')}
        </span>
      )}
    </div>
  );
}
```

---

## Resultado

O usuario vera abaixo do botao "Atualizar dados" uma linha com:
`Atualizado: 05/02/2026, 14:30:45` (formato brasileiro)
