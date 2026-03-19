import { useCallback, useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, Check, RefreshCw, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPIRecord } from "@/types/kpi";
import { parseXLSXFile } from "@/lib/kpiUtils";
import { validateUploadPermissions, validateMonthRestriction } from "@/lib/permissions";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { z } from "zod";

// ============= UPLOAD VALIDATION SCHEMA =============
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_STATUSES = ["Realizado", "Planejado Mês", "Planejado Semana", "Planejado Geral"] as const;
const MONTH_KEY_REGEX = /^[a-zA-Z]{3}[-/]\d{2}$/; // e.g. "jan-26" or "Jan/25"

const KPIRecordSchema = z.object({
  Assessor: z.string().min(1, "Assessor não pode ser vazio").max(150),
  Categorias: z.string().min(1, "Categorias não pode ser vazio").max(250),
  Status: z.enum(ALLOWED_STATUSES, {
    errorMap: () => ({ message: `Status inválido. Permitidos: ${ALLOWED_STATUSES.join(", ")}` }),
  }),
}).catchall(
  // All extra keys must be valid month keys with numeric values
  z.union([
    z.number().min(-1e9).max(1e9),
    z.string().transform((v) => {
      const n = parseFloat(v);
      if (isNaN(n)) throw new Error("Valor numérico inválido");
      return n;
    }),
    z.null(),
    z.undefined(),
  ])
);

const KPIRecordsArraySchema = z.array(KPIRecordSchema).min(1).max(50000);

function validateKPIRecords(records: unknown[]): { valid: boolean; error?: string } {
  // Check for prototype pollution keys
  const dangerousKeys = ["__proto__", "constructor", "prototype"];
  for (const record of records) {
    if (record && typeof record === "object") {
      for (const key of dangerousKeys) {
        if (key in (record as object)) {
          return { valid: false, error: "Arquivo contém dados inválidos ou maliciosos." };
        }
      }
    }
  }

  const result = KPIRecordsArraySchema.safeParse(records);
  if (!result.success) {
    const firstIssue = result.error.issues[0];
    const path = firstIssue.path.join(".");
    return {
      valid: false,
      error: `Dado inválido${path ? ` (${path})` : ""}: ${firstIssue.message}`,
    };
  }
  return { valid: true };
}

interface FileUploadProps {
  onDataLoaded: (data: KPIRecord[]) => void;
  compact?: boolean;
  lastUpdate?: string | null;
  role?: string | null;
  assessorName?: string | null;
  openMonth?: string | null;
}

export function FileUpload({ onDataLoaded, compact = false, lastUpdate, role, assessorName, openMonth }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);
      setSuccess(false);
      setFileName(file.name);

      // File size limit
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError("Arquivo muito grande. Tamanho máximo: 10MB.");
        return;
      }

      const isXLSX = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
      const isJSON = file.name.endsWith(".json");

      if (!isXLSX && !isJSON) {
        setError("Por favor, envie um arquivo XLSX ou JSON.");
        return;
      }

      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          let records: KPIRecord[];

          if (isXLSX) {
            const buffer = e.target?.result as ArrayBuffer;
            records = await parseXLSXFile(buffer);
          } else {
            const content = e.target?.result as string;
            let data: unknown;
            try {
              data = JSON.parse(content);
            } catch {
              setError("Arquivo JSON inválido. Verifique o formato.");
              return;
            }
            records = Array.isArray(data) ? data : [data];
          }

          if (records.length === 0) {
            setError("O arquivo está vazio.");
            return;
          }

          // Schema & content validation
          const schemaCheck = validateKPIRecords(records);
          if (!schemaCheck.valid) {
            setError(schemaCheck.error || "Dados inválidos no arquivo.");
            return;
          }

          const firstRecord = records[0];
          if (!firstRecord.Assessor || !firstRecord.Categorias || !firstRecord.Status) {
            setError("Estrutura de dados inválida. Campos obrigatórios: Assessor, Categorias, Status");
            return;
          }

          // Validate open month restriction
          if (openMonth) {
            const monthCheck = validateMonthRestriction(records, openMonth);
            if (!monthCheck.valid) {
              setError(monthCheck.error || "Mês não está aberto para lançamentos.");
              return;
            }
          }

          // Validate upload permissions (sócio can only upload own records)
          if (role && assessorName) {
            const permCheck = validateUploadPermissions(records, role, assessorName);
            if (!permCheck.valid) {
              setError(permCheck.error || "Sem permissão para este upload.");
              return;
            }
          }

          setSuccess(true);
          onDataLoaded(records);
        } catch (err) {
          setError("Erro ao processar o arquivo. Verifique o formato.");
        }
      };

      if (isXLSX) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    },
    [onDataLoaded, role, assessorName, openMonth]
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
      // Reset input value to allow selecting the same file again
      e.target.value = "";
    },
    [processFile]
  );

  const isMonthClosed = !openMonth;

  if (compact) {
    if (isMonthClosed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-col items-center">
                <Button variant="outline" size="sm" className="gap-2 opacity-50 cursor-not-allowed" disabled>
                  <Lock className="h-4 w-4" />
                  Mês fechado
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              Nenhum mês aberto para lançamentos
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div className="relative flex flex-col items-center">
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
        {lastUpdate && (
          <span className="text-[8px] text-muted-foreground mt-1">
            Atualizado: {new Date(lastUpdate).toLocaleString('pt-BR')}
          </span>
        )}
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
