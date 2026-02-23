import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { SPRINT_PRODUCTS } from "@/types/kpi";
import { toast } from "@/hooks/use-toast";

interface SprintChallengeModalProps {
  assessors: string[];
  selectedMonth: string;
  onChallengeCreated: () => void;
}

interface KPITarget {
  category: string;
  targetValue: string;
}

export function SprintChallengeModal({ assessors, selectedMonth, onChallengeCreated }: SprintChallengeModalProps) {
  const [open, setOpen] = useState(false);
  const [assessor, setAssessor] = useState("");
  const [selectedKPIs, setSelectedKPIs] = useState<Map<string, string>>(new Map());
  const [deadline, setDeadline] = useState<Date>();
  const [saving, setSaving] = useState(false);

  const toggleKPI = (category: string) => {
    setSelectedKPIs(prev => {
      const next = new Map(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.set(category, "");
      }
      return next;
    });
  };

  const setKPITarget = (category: string, value: string) => {
    setSelectedKPIs(prev => {
      const next = new Map(prev);
      next.set(category, value);
      return next;
    });
  };

  const handleSave = async () => {
    if (!assessor || selectedKPIs.size === 0 || !deadline) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    // Validate all targets have values
    const entries = Array.from(selectedKPIs.entries());
    const invalidEntries = entries.filter(([, v]) => !v || parseFloat(v) <= 0);
    if (invalidEntries.length > 0) {
      toast({ title: "Preencha a meta de todos os KPIs selecionados", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const rows = entries.map(([category, targetValue]) => ({
        assessor_name: assessor,
        category,
        target_value: parseFloat(targetValue),
        deadline: deadline.toISOString(),
        month: selectedMonth,
        is_active: true,
      }));

      const { error } = await supabase.from("sprint_challenges" as any).insert(rows as any);
      if (error) throw error;

      toast({ title: `${rows.length} desafio(s) criado(s)! 🎯` });
      setOpen(false);
      setAssessor("");
      setSelectedKPIs(new Map());
      setDeadline(undefined);
      onChallengeCreated();
    } catch (err) {
      console.error(err);
      toast({ title: "Erro ao criar desafio", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-scale-3 text-scale-6 gap-1">
          <Plus className="size-3" />
          Desafio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Desafio 🎯</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 pt-2">
          <div className="space-y-1.5">
            <Label>Assessor</Label>
            <Select value={assessor} onValueChange={setAssessor}>
              <SelectTrigger><SelectValue placeholder="Selecionar assessor" /></SelectTrigger>
              <SelectContent>
                {assessors.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>KPIs e Metas</Label>
            <div className="space-y-2 rounded-md border p-3">
              {SPRINT_PRODUCTS.map(p => {
                const isChecked = selectedKPIs.has(p.category);
                return (
                  <div key={p.category} className="flex items-center gap-2">
                    <Checkbox
                      id={`kpi-${p.category}`}
                      checked={isChecked}
                      onCheckedChange={() => toggleKPI(p.category)}
                    />
                    <label
                      htmlFor={`kpi-${p.category}`}
                      className="text-sm flex-shrink-0 w-24 cursor-pointer"
                    >
                      {p.label}
                    </label>
                    {isChecked && (
                      <Input
                        type="number"
                        placeholder={p.isCurrency ? "R$ meta" : "Meta"}
                        className="h-8 text-sm flex-1"
                        value={selectedKPIs.get(p.category) || ""}
                        onChange={e => setKPITarget(p.category, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Prazo (único para todos)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {deadline ? format(deadline, "PPP", { locale: pt }) : "Selecionar prazo"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={deadline}
                  onSelect={setDeadline}
                  disabled={date => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button onClick={handleSave} disabled={saving || selectedKPIs.size === 0} className="mt-2">
            {saving ? "Salvando..." : `Criar ${selectedKPIs.size > 0 ? selectedKPIs.size : ""} Desafio${selectedKPIs.size !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
