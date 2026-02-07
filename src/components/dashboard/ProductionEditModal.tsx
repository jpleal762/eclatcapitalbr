import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Save, Lock } from "lucide-react";
import { isAdmin, canEditAssessor, updateLastProductionUpdate } from "@/lib/permissions";

interface KPIEditRow {
  id: string;
  assessor: string;
  categorias: string;
  status: string;
  currentValue: number;
  newValue: number;
  monthKey: string; // e.g. "Feb-26"
  monthlyData: Record<string, unknown>;
}

interface ProductionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: string | null;
  assessorName: string | null;
  openMonth: string | null;
  tokenId: string | null;
  onDataUpdated: () => void;
}

// Map "fev-26" -> "Feb-26" for monthly_data keys
const MONTH_MAP: Record<string, string> = {
  jan: "Jan", fev: "Feb", mar: "Mar", abr: "Apr",
  mai: "May", jun: "Jun", jul: "Jul", ago: "Aug",
  set: "Sep", out: "Oct", nov: "Nov", dez: "Dec",
};

function openMonthToKey(openMonth: string): string | null {
  const parts = openMonth.split("-");
  if (parts.length !== 2) return null;
  const eng = MONTH_MAP[parts[0].toLowerCase()];
  if (!eng) return null;
  return `${eng}-${parts[1]}`;
}

function formatMonthLabel(openMonth: string): string {
  const parts = openMonth.split("-");
  if (parts.length !== 2) return openMonth;
  return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)}/${parts[1]}`;
}

export function ProductionEditModal({
  isOpen,
  onClose,
  role,
  assessorName,
  openMonth,
  tokenId,
  onDataUpdated,
}: ProductionEditModalProps) {
  const [rows, setRows] = useState<KPIEditRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const monthKey = useMemo(() => (openMonth ? openMonthToKey(openMonth) : null), [openMonth]);
  const isLocked = !openMonth || !monthKey;

  useEffect(() => {
    if (isOpen && monthKey) {
      loadRecords();
    }
  }, [isOpen, monthKey]);

  const loadRecords = async () => {
    if (!monthKey) return;
    setIsLoading(true);
    try {
      let query = supabase
        .from("kpi_records")
        .select("id, assessor, categorias, status, monthly_data")
        .eq("status", "Realizado")
        .order("assessor")
        .order("categorias");

      // Sócio only sees their own records
      if (!isAdmin(role) && assessorName) {
        query = query.eq("assessor", assessorName);
      }

      const { data, error } = await query;
      if (error) throw error;

      const editRows: KPIEditRow[] = (data || []).map((r) => {
        const md = r.monthly_data as Record<string, unknown>;
        const val = typeof md[monthKey] === "number" ? (md[monthKey] as number) : 0;
        return {
          id: r.id,
          assessor: r.assessor,
          categorias: r.categorias,
          status: r.status,
          currentValue: val,
          newValue: val,
          monthKey,
          monthlyData: md,
        };
      });

      setRows(editRows);
    } catch (err) {
      console.error("Erro ao carregar registros:", err);
      toast.error("Erro ao carregar registros");
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (id: string, value: string) => {
    const numValue = value === "" ? 0 : parseFloat(value);
    if (isNaN(numValue)) return;
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, newValue: numValue } : r))
    );
  };

  const changedRows = useMemo(
    () => rows.filter((r) => r.newValue !== r.currentValue),
    [rows]
  );

  const handleSave = async () => {
    if (changedRows.length === 0) {
      onClose();
      return;
    }

    // Permission check for sócio
    if (!isAdmin(role) && assessorName) {
      const unauthorized = changedRows.filter(
        (r) => !canEditAssessor(role, assessorName, r.assessor)
      );
      if (unauthorized.length > 0) {
        toast.error("Você só pode editar seus próprios registros.");
        return;
      }
    }

    setIsSaving(true);
    try {
      const auditName = assessorName || "Escritório";

      for (const row of changedRows) {
        const updatedMonthlyData = { ...row.monthlyData, [row.monthKey]: row.newValue };
        const { error } = await supabase
          .from("kpi_records")
          .update({
            monthly_data: updatedMonthlyData,
            updated_by: auditName,
          } as any)
          .eq("id", row.id);

        if (error) throw error;
      }

      // Update last production update for token user
      if (tokenId) {
        await updateLastProductionUpdate(tokenId);
      }

      toast.success(`${changedRows.length} registro(s) atualizado(s) com sucesso!`);
      onDataUpdated();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  // Group rows by assessor
  const groupedRows = useMemo(() => {
    const groups: Record<string, KPIEditRow[]> = {};
    for (const row of rows) {
      if (!groups[row.assessor]) groups[row.assessor] = [];
      groups[row.assessor].push(row);
    }
    return groups;
  }, [rows]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            📝 Editar Produção Individual
          </DialogTitle>
          <DialogDescription>
            {isLocked ? (
              <span className="flex items-center gap-1 text-destructive">
                <Lock className="h-3 w-3" />
                Nenhum mês aberto para lançamentos.
              </span>
            ) : (
              <>
                Editando valores de <strong>Realizado</strong> para{" "}
                <strong>{formatMonthLabel(openMonth!)}</strong>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {isLocked ? (
            <div className="text-center py-12 text-muted-foreground">
              <Lock className="h-8 w-8 mx-auto mb-2" />
              <p>Solicite ao administrador para abrir um mês.</p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum registro de produção encontrado.
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedRows).map(([assessor, assessorRows]) => (
                <div key={assessor}>
                  {isAdmin(role) && (
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
                      {assessor}
                    </h4>
                  )}
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Categoria</TableHead>
                          <TableHead className="text-right w-32">
                            Valor Atual
                          </TableHead>
                          <TableHead className="text-right w-36">
                            Novo Valor
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assessorRows.map((row) => {
                          const canEdit =
                            isAdmin(role) ||
                            (assessorName
                              ? canEditAssessor(role, assessorName, row.assessor)
                              : true);
                          const hasChanged = row.newValue !== row.currentValue;

                          return (
                            <TableRow
                              key={row.id}
                              className={hasChanged ? "bg-primary/5" : ""}
                            >
                              <TableCell className="font-medium text-sm">
                                {row.categorias}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {row.currentValue.toLocaleString("pt-BR")}
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  step="any"
                                  value={row.newValue || ""}
                                  onChange={(e) =>
                                    handleValueChange(row.id, e.target.value)
                                  }
                                  disabled={!canEdit}
                                  className="w-28 ml-auto text-right h-8 text-sm"
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          {changedRows.length > 0 && (
            <span className="text-xs text-muted-foreground mr-auto">
              {changedRows.length} alteração(ões)
            </span>
          )}
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || changedRows.length === 0 || isLocked}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
