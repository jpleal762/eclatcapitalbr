import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, Check, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPIRecord } from "@/types/kpi";
import { parseXLSXFile } from "@/lib/kpiUtils";

interface FileUploadProps {
  onDataLoaded: (data: KPIRecord[]) => void;
  compact?: boolean;
}

export function FileUpload({ onDataLoaded, compact = false }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      setSuccess(false);
      setFileName(file.name);

      const isXLSX = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
      const isJSON = file.name.endsWith(".json");

      if (!isXLSX && !isJSON) {
        setError("Por favor, envie um arquivo XLSX ou JSON.");
        return;
      }

      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let records: KPIRecord[];

          if (isXLSX) {
            const buffer = e.target?.result as ArrayBuffer;
            records = parseXLSXFile(buffer);
          } else {
            const content = e.target?.result as string;
            const data = JSON.parse(content);
            records = Array.isArray(data) ? data : [data];
          }

          if (records.length === 0) {
            setError("O arquivo está vazio.");
            return;
          }

          const firstRecord = records[0];
          if (!firstRecord.Assessor || !firstRecord.Categorias || !firstRecord.Status) {
            setError("Estrutura de dados inválida. Campos obrigatórios: Assessor, Categorias, Status");
            return;
          }

          setSuccess(true);
          onDataLoaded(records);
        } catch (err) {
          console.error(err);
          setError("Erro ao processar o arquivo. Verifique o formato.");
        }
      };

      if (isXLSX) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    },
    [onDataLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  if (compact) {
    return (
      <div className="relative">
        <input
          type="file"
          accept=".xlsx,.xls,.json"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileInput}
        />
        <Button variant="outline" size="sm" className="gap-2 pointer-events-none">
          <RefreshCw className="h-4 w-4" />
          Atualizar dados
        </Button>
      </div>
    );
  }

  return (
    <Card
      className={`relative overflow-hidden border-2 border-dashed transition-all duration-300 shadow-card ${
        isDragOver
          ? "border-primary bg-primary/10"
          : success
          ? "border-success bg-success/10"
          : error
          ? "border-destructive bg-destructive/10"
          : "border-border hover:border-primary/50 bg-card"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div
          className={`rounded-full p-4 transition-colors ${
            success
              ? "bg-success/20 text-success"
              : error
              ? "bg-destructive/20 text-destructive"
              : "bg-primary/20 text-primary"
          }`}
        >
          {success ? (
            <Check className="h-8 w-8" />
          ) : error ? (
            <AlertCircle className="h-8 w-8" />
          ) : isDragOver ? (
            <FileSpreadsheet className="h-8 w-8" />
          ) : (
            <Upload className="h-8 w-8" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {success
              ? "Dados carregados com sucesso!"
              : error
              ? "Erro no upload"
              : "Carregar dados KPI"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {success && fileName
              ? `Arquivo: ${fileName}`
              : error
              ? error
              : "Arraste e solte seu arquivo XLSX ou JSON aqui, ou clique para selecionar"}
          </p>
        </div>

        {!success && (
          <label>
            <input
              type="file"
              accept=".xlsx,.xls,.json"
              className="hidden"
              onChange={handleFileInput}
            />
            <Button className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90" asChild>
              <span>Selecionar arquivo</span>
            </Button>
          </label>
        )}

        {success && (
          <label>
            <input
              type="file"
              accept=".xlsx,.xls,.json"
              className="hidden"
              onChange={handleFileInput}
            />
            <Button variant="outline" size="sm" className="cursor-pointer" asChild>
              <span>Carregar outro arquivo</span>
            </Button>
          </label>
        )}
      </div>
    </Card>
  );
}
