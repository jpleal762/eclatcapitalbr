import { useState, useEffect } from "react";
import { Zap, Plus, X, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "eclat-weekly-actions";

export interface WeeklyAction {
  id: number;
  text: string;
}

interface EclatWeeklyActionsProps {
  actions: WeeklyAction[];
}

// ── Hook to load/save actions ──────────────────────────────────────────────
export function useWeeklyActions() {
  const [actions, setActions] = useState<WeeklyAction[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", STORAGE_KEY)
          .maybeSingle();
        if (data?.value) {
          setActions(JSON.parse(data.value));
          return;
        }
      } catch {}
      const local = localStorage.getItem(STORAGE_KEY);
      if (local) {
        try { setActions(JSON.parse(local)); } catch {}
      }
    };
    load();
  }, []);

  const save = async (next: WeeklyAction[]) => {
    setActions(next);
    const json = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY, json);
    await supabase
      .from("app_settings")
      .upsert({ key: STORAGE_KEY, value: json, updated_at: new Date().toISOString() }, { onConflict: "key" });
  };

  return { actions, save };
}

// ── Inline display in ICMCard ──────────────────────────────────────────────
export function EclatWeeklyActions({ actions }: EclatWeeklyActionsProps) {
  if (actions.length === 0) {
    return (
      <div className="mt-2 rounded-xl border border-border bg-muted px-3 py-2">
        <div className="flex items-center gap-1.5 mb-1">
          <Zap className="h-3 w-3 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Ações Éclat da Semana</span>
        </div>
        <p className="text-[10px] text-muted-foreground italic">Defina as ações em Ajustes →</p>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-border bg-muted px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-2">
        <Zap className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Ações Éclat da Semana</span>
      </div>
      <ol className="space-y-1">
        {actions.map((a, i) => (
          <li key={a.id} className="flex items-start gap-2">
            <span className="flex-shrink-0 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-[11px] text-foreground leading-snug">{a.text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ── Editor used inside the Settings sidebar ────────────────────────────────
export function WeeklyActionsEditor({
  actions,
  onSave,
}: {
  actions: WeeklyAction[];
  onSave: (next: WeeklyAction[]) => Promise<void>;
}) {
  const [draft, setDraft] = useState<WeeklyAction[]>(actions);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync if parent actions change (e.g. on first load)
  useEffect(() => { setDraft(actions); }, [actions]);

  const add = () => {
    if (draft.length >= 3) return;
    setDraft(prev => [...prev, { id: Date.now(), text: "" }]);
  };

  const remove = (id: number) => setDraft(prev => prev.filter(a => a.id !== id));

  const update = (id: number, text: string) =>
    setDraft(prev => prev.map(a => a.id === id ? { ...a, text } : a));

  const handleSave = async () => {
    const cleaned = draft.filter(a => a.text.trim() !== "");
    setSaving(true);
    await onSave(cleaned);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-2 p-3 bg-muted rounded-lg border border-border">
      <div className="flex items-center gap-1.5 mb-1">
        <Zap className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">Ações Éclat da Semana</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{draft.length}/3</span>
      </div>

      <div className="space-y-1.5">
        {draft.map((a, i) => (
          <div key={a.id} className="flex items-center gap-1.5">
            <span className="w-4 h-4 flex-shrink-0 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <input
              value={a.text}
              onChange={e => update(a.id, e.target.value)}
              placeholder={`Ação ${i + 1}...`}
              maxLength={80}
              className="flex-1 text-xs bg-background border border-border rounded-md px-2 py-1 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => remove(a.id)}
              className="p-0.5 rounded text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 pt-1">
        {draft.length < 3 && (
          <button
            onClick={add}
            className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="h-3 w-3" /> Adicionar
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="ml-auto flex items-center gap-1 text-[10px] bg-primary text-primary-foreground px-2 py-1 rounded-md font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-3 w-3" />
          {saving ? "Salvando..." : saved ? "Salvo ✓" : "Salvar"}
        </button>
      </div>
    </div>
  );
}
