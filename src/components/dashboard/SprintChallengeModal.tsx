import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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

export function SprintChallengeModal({ assessors, selectedMonth, onChallengeCreated }: SprintChallengeModalProps) {
  const [open, setOpen] = useState(false);
  const [assessor, setAssessor] = useState("");
  const [category, setCategory] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [deadline, setDeadline] = useState<Date>();
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!assessor || !category || !targetValue || !deadline) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("sprint_challenges" as any).insert({
        assessor_name: assessor,
        category,
        target_value: parseFloat(targetValue),
        deadline: deadline.toISOString(),
        month: selectedMonth,
        is_active: true,
      } as any);

      if (error) throw error;

      toast({ title: "Desafio criado! 🎯" });
      setOpen(false);
      setAssessor("");
      setCategory("");
      setTargetValue("");
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
      <DialogContent className="sm:max-w-[400px]">
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

          <div className="space-y-1.5">
            <Label>KPI</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Selecionar KPI" /></SelectTrigger>
              <SelectContent>
                {SPRINT_PRODUCTS.map(p => (
                  <SelectItem key={p.category} value={p.category}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Meta</Label>
            <Input
              type="number"
              placeholder="Ex: 500000"
              value={targetValue}
              onChange={e => setTargetValue(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Prazo</Label>
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

          <Button onClick={handleSave} disabled={saving} className="mt-2">
            {saving ? "Salvando..." : "Criar Desafio"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
