import React, { useState } from "react";
import { X, Save, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GaugeKPI } from "@/types/kpi";

interface TVConfigProps {
  isOpen: boolean;
  onClose: () => void;
  mensagemDia: string;
  setMensagemDia: (v: string) => void;
  kpiPrioridade: string;
  setKpiPrioridade: (v: string) => void;
  isRotating: boolean;
  setIsRotating: (v: boolean) => void;
  screenDurations: number[];
  setScreenDurations: (v: number[]) => void;
  gaugeKPIs: GaugeKPI[];
}

const SCREEN_NAMES = ["Comando do Dia", "Performance KPIs", "Por Assessor", "Reconhecimento"];

export function TVConfig({
  isOpen, onClose, mensagemDia, setMensagemDia, kpiPrioridade, setKpiPrioridade,
  isRotating, setIsRotating, screenDurations, setScreenDurations, gaugeKPIs,
}: TVConfigProps) {
  const [saving, setSaving] = useState(false);
  const [localMsg, setLocalMsg] = useState(mensagemDia);
  const [localKpi, setLocalKpi] = useState(kpiPrioridade);
  const [localDurations, setLocalDurations] = useState(screenDurations);

  React.useEffect(() => {
    if (isOpen) {
      setLocalMsg(mensagemDia);
      setLocalKpi(kpiPrioridade);
      setLocalDurations(screenDurations);
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    setMensagemDia(localMsg);
    setKpiPrioridade(localKpi);
    setScreenDurations(localDurations);

    try {
      await Promise.all([
        supabase.from("app_settings").upsert({ key: "tv-mensagem-dia", value: localMsg, updated_at: new Date().toISOString() }, { onConflict: "key" }),
        supabase.from("app_settings").upsert({ key: "tv-kpi-prioridade", value: localKpi, updated_at: new Date().toISOString() }, { onConflict: "key" }),
        supabase.from("app_settings").upsert({ key: "tv-screen-durations", value: JSON.stringify(localDurations), updated_at: new Date().toISOString() }, { onConflict: "key" }),
      ]);
    } catch {}

    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-tv-card border border-tv-border rounded-2xl p-6 w-[480px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-tv-text">Configurações TV</h2>
          <button onClick={onClose} className="p-1.5 rounded text-tv-muted hover:text-tv-text hover:bg-tv-border">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Config fields */}
        <div className="space-y-5">
          {/* Mensagem do dia */}
          <div>
            <label className="block text-xs font-bold text-tv-muted uppercase tracking-wider mb-2">
              Mensagem do Dia
            </label>
            <textarea
              value={localMsg}
              onChange={e => setLocalMsg(e.target.value)}
              placeholder="Deixe vazio para mensagem automática baseada no gargalo"
              rows={2}
              className="w-full bg-tv-bg border border-tv-border rounded-lg px-3 py-2 text-sm text-tv-text placeholder:text-tv-muted resize-none focus:outline-none focus:border-tv-gold"
            />
          </div>

          {/* KPI Prioridade */}
          <div>
            <label className="block text-xs font-bold text-tv-muted uppercase tracking-wider mb-2">
              KPI Prioridade do Mês
            </label>
            <select
              value={localKpi}
              onChange={e => setLocalKpi(e.target.value)}
              className="w-full bg-tv-bg border border-tv-border rounded-lg px-3 py-2 text-sm text-tv-text focus:outline-none focus:border-tv-gold"
            >
              <option value="">Automático (maior gargalo)</option>
              {gaugeKPIs.map(k => (
                <option key={k.label} value={k.label}>{k.label}</option>
              ))}
            </select>
          </div>

          {/* Rotação */}
          <div>
            <label className="block text-xs font-bold text-tv-muted uppercase tracking-wider mb-2">
              Rotação Automática
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsRotating(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${isRotating ? "bg-tv-gold text-black border-tv-gold" : "border-tv-border text-tv-muted hover:text-tv-text hover:bg-tv-border"}`}
              >
                Ativa
              </button>
              <button
                onClick={() => setIsRotating(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${!isRotating ? "bg-tv-red text-white border-tv-red" : "border-tv-border text-tv-muted hover:text-tv-text hover:bg-tv-border"}`}
              >
                Pausada
              </button>
            </div>
          </div>

          {/* Durações das telas */}
          <div>
            <label className="block text-xs font-bold text-tv-muted uppercase tracking-wider mb-2">
              Duração por Tela (segundos)
            </label>
            <div className="space-y-2">
              {SCREEN_NAMES.map((name, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-xs text-tv-muted w-36">{name}</span>
                  <input
                    type="number"
                    min={3}
                    max={120}
                    value={localDurations[idx]}
                    onChange={e => {
                      const copy = [...localDurations];
                      copy[idx] = Math.max(3, parseInt(e.target.value) || 10);
                      setLocalDurations(copy);
                    }}
                    className="w-20 bg-tv-bg border border-tv-border rounded-lg px-2 py-1 text-sm text-tv-text text-center focus:outline-none focus:border-tv-gold"
                  />
                  <span className="text-xs text-tv-muted">seg</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-tv-border text-tv-muted hover:text-tv-text hover:bg-tv-border text-sm font-semibold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-tv-gold text-black text-sm font-bold transition-all hover:bg-tv-gold/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
