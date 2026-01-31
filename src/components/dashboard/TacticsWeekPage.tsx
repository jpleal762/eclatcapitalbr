import { useState, useMemo } from "react";
import { ProcessedKPI, WeeklyTactic, AssessorTactics } from "@/types/kpi";
import { AssessorTacticsCard } from "./AssessorTacticsCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Lightbulb, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// Playbook de táticas baseadas em gaps de KPI
const KPI_TACTICS_PLAYBOOK: Record<string, string[]> = {
  "Captação net": [
    "Ligar para 5 clientes com CDB vencendo esta semana",
    "Contatar 3 clientes com resgate de previdência programado",
    "Enviar Champion Letter para aportes em poupança",
    "Propor portabilidade para 2 clientes com previdência externa",
  ],
  "Receita": [
    "Revisar carteira de 3 clientes com ROA abaixo de 1%",
    "Propor diversificação para clientes concentrados em renda fixa",
    "Follow-up em propostas de estruturadas abertas",
    "Contatar clientes com vencimentos de renda fixa este mês",
  ],
  "Diversificada ( ROA>1,5)": [
    "Propor FIIs para 3 clientes com perfil moderado",
    "Apresentar fundos multimercado para clientes conservadores",
    "Revisar alocação de 2 clientes com patrimônio concentrado",
    "Sugerir COE para clientes buscando retorno assimétrico",
  ],
  "Parceiros Tri": [
    "Pedir 2 indicações para clientes satisfeitos",
    "Contatar leads de indicações pendentes",
    "Participar de evento de networking esta semana",
    "Ativar parceiros que não indicam há 30 dias",
  ],
  "Primeira reuniao": [
    "Realizar blitz de 20 ligações entre 10h-12h",
    "Recontatar leads frios do mês passado",
    "Agendar reuniões com leads de eventos recentes",
    "Follow-up em leads de redes sociais",
  ],
  "Habilitacao": [
    "Enviar tutorial de cadastro para leads pendentes",
    "Ligar para clientes com cadastro incompleto",
    "Acompanhar habilitações travadas há mais de 3 dias",
  ],
  "Ativacao": [
    "Ligar para clientes habilitados sem aporte",
    "Enviar proposta de primeiro investimento",
    "Agendar call de orientação para novos clientes",
  ],
  "Contatos": [
    "Aumentar volume de ligações diárias para 25",
    "Implementar rotina de prospecção 9h-11h",
    "Utilizar lista de leads quentes priorizados",
  ],
  "Agendamentos": [
    "Melhorar script de abordagem para conversão",
    "Testar novos horários de ligação",
    "Focar em leads com maior potencial de agendamento",
  ],
};

// Ações gerais do time (playbook)
const GENERAL_TACTICS_PLAYBOOK: string[] = [
  "Reunião de alinhamento semanal às segundas 9h",
  "Blitz coletiva de prospecção - Quarta 10h-12h",
  "Compartilhar 1 case de sucesso no grupo",
  "Revisar pipeline em conjunto na sexta às 16h",
  "Meta: 100 ligações coletivas esta semana",
  "Evento de relacionamento com clientes top",
  "Campanha de indicações ativa",
  "Foco em conversão de leads quentes",
];

interface TacticsWeekPageProps {
  processedData: ProcessedKPI[];
  assessors: string[];
  months: string[];
  selectedAssessor: string;
  selectedMonth: string;
  onAssessorChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  isAssessorLocked?: boolean;
}

// Função para gerar táticas baseadas nos gaps de KPI
function generateTacticsForAssessor(
  assessorName: string,
  processedData: ProcessedKPI[],
  month: string
): WeeklyTactic[] {
  // Encontrar categorias com gaps (onde realizado < planejado)
  const assessorData = processedData.filter(
    (d) => d.assessor.toLowerCase() === assessorName.toLowerCase()
  );

  const gaps: { category: string; gap: number }[] = [];

  // Calcular gaps por categoria
  const categories = [
    "Captação net",
    "Receita",
    "Diversificada ( ROA>1,5)",
    "Parceiros Tri",
    "Primeira reuniao",
    "Habilitacao",
    "Ativacao",
  ];

  categories.forEach((cat) => {
    const planned = assessorData.find(
      (d) =>
        d.category === cat &&
        (d.status === "Planejado Mensal" || d.status === "Planejado Semanal")
    );
    const realized = assessorData.find(
      (d) => d.category === cat && d.status === "Realizado"
    );

    if (planned && realized) {
      const plannedValue =
        planned.monthlyData.find((m) => m.month.toLowerCase() === month.toLowerCase())
          ?.value || 0;
      const realizedValue =
        realized.monthlyData.find((m) => m.month.toLowerCase() === month.toLowerCase())
          ?.value || 0;

      if (plannedValue > 0 && realizedValue < plannedValue) {
        gaps.push({
          category: cat,
          gap: (plannedValue - realizedValue) / plannedValue,
        });
      }
    }
  });

  // Ordenar por maior gap
  gaps.sort((a, b) => b.gap - a.gap);

  // Gerar 3 táticas baseadas nos maiores gaps
  const tactics: WeeklyTactic[] = [];
  const usedCategories = new Set<string>();

  for (const { category } of gaps) {
    if (tactics.length >= 3) break;
    if (usedCategories.has(category)) continue;

    const playbook = KPI_TACTICS_PLAYBOOK[category];
    if (playbook && playbook.length > 0) {
      // Selecionar tática aleatória do playbook para a categoria
      const randomIndex = Math.floor(
        Math.random() * Math.min(playbook.length, 2)
      );
      const tacticText = playbook[randomIndex];

      // Mapear categoria para label amigável
      const categoryLabel = getCategoryLabel(category);

      tactics.push({
        id: `${assessorName}-${category}-${Date.now()}-${tactics.length}`,
        text: tacticText,
        category: categoryLabel,
        status: "pending",
      });
      usedCategories.add(category);
    }
  }

  // Se não tiver 3 táticas, completar com táticas genéricas de prospecção
  while (tactics.length < 3) {
    const fallbackCategories = ["Primeira reuniao", "Captação net", "Receita"];
    for (const cat of fallbackCategories) {
      if (tactics.length >= 3) break;
      const categoryLabel = getCategoryLabel(cat);
      if (
        !tactics.some((t) => t.category === categoryLabel) &&
        KPI_TACTICS_PLAYBOOK[cat]
      ) {
        const playbook = KPI_TACTICS_PLAYBOOK[cat];
        tactics.push({
          id: `${assessorName}-fallback-${Date.now()}-${tactics.length}`,
          text: playbook[Math.floor(Math.random() * playbook.length)],
          category: categoryLabel,
          status: "pending",
        });
      }
    }
    // Evitar loop infinito
    if (tactics.length < 3) {
      tactics.push({
        id: `${assessorName}-generic-${Date.now()}-${tactics.length}`,
        text: "Revisar pipeline de oportunidades",
        category: "Pipeline",
        status: "pending",
      });
    }
  }

  return tactics.slice(0, 3);
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    "Captação net": "Captação NET",
    "Receita": "Receita",
    "Diversificada ( ROA>1,5)": "Diversificação",
    "Parceiros Tri": "Prospecção",
    "Primeira reuniao": "Reuniões",
    "Habilitacao": "Habilitação",
    "Ativacao": "Ativação",
    "Contatos": "Prospecção",
    "Agendamentos": "Reuniões",
  };
  return labels[category] || category;
}

export function TacticsWeekPage({
  processedData,
  assessors,
  months,
  selectedAssessor,
  selectedMonth,
  onAssessorChange,
  onMonthChange,
  isAssessorLocked = false,
}: TacticsWeekPageProps) {
  // Estado local para status das táticas (pode ser persistido futuramente)
  const [tacticStatuses, setTacticStatuses] = useState<
    Record<string, WeeklyTactic["status"]>
  >({});

  // Estado para ação geral do time
  const [generalTactic, setGeneralTactic] = useState<WeeklyTactic>(() => ({
    id: "general-team-tactic",
    text: GENERAL_TACTICS_PLAYBOOK[0],
    category: "Time",
    status: "pending",
  }));

  // Gerar táticas para todos os assessores ou apenas o selecionado
  const assessorTactics: AssessorTactics[] = useMemo(() => {
    const targetAssessors =
      selectedAssessor === "all"
        ? assessors
        : assessors.filter(
            (a) => a.toLowerCase() === selectedAssessor.toLowerCase()
          );

    return targetAssessors.map((name) => {
      const tactics = generateTacticsForAssessor(
        name,
        processedData,
        selectedMonth
      );
      // Aplicar status salvos
      return {
        assessorName: name,
        tactics: tactics.map((t) => ({
          ...t,
          status: tacticStatuses[t.id] || t.status,
        })),
      };
    });
  }, [assessors, selectedAssessor, processedData, selectedMonth, tacticStatuses]);

  const handleStatusChange = (
    tacticId: string,
    newStatus: WeeklyTactic["status"]
  ) => {
    setTacticStatuses((prev) => ({
      ...prev,
      [tacticId]: newStatus,
    }));
  };

  const handleGeneralTacticToggle = () => {
    setGeneralTactic((prev) => ({
      ...prev,
      status: prev.status === "done" ? "pending" : "done",
    }));
  };

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in overflow-hidden">
      {/* Header with Title and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">
            Tática da Semana
          </h1>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              Assessor
            </Label>
            <Select
              value={selectedAssessor}
              onValueChange={onAssessorChange}
              disabled={isAssessorLocked}
            >
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {assessors.map((assessor) => (
                  <SelectItem key={assessor} value={assessor}>
                    {assessor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground whitespace-nowrap">
              Mês
            </Label>
            <Select value={selectedMonth} onValueChange={onMonthChange}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* General Team Action Card */}
      <div className="flex-shrink-0">
        <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10 p-4 shadow-sm">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div className="p-3 rounded-full bg-primary/10 flex-shrink-0">
              <Users className="h-6 w-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Ação Geral do Time
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-2 py-0.5 font-normal border-0 bg-primary/10 text-primary"
                >
                  Todos
                </Badge>
              </div>
              <p
                className={cn(
                  "text-base font-medium text-foreground",
                  generalTactic.status === "done" && "line-through text-muted-foreground"
                )}
              >
                {generalTactic.text}
              </p>
            </div>

            {/* Checkbox */}
            <div className="flex-shrink-0">
              <Checkbox
                checked={generalTactic.status === "done"}
                onCheckedChange={handleGeneralTacticToggle}
                className="h-6 w-6"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Assessor Cards Grid */}
      <div
        className={cn(
          "flex-1 overflow-y-auto lg:overflow-hidden",
          "grid gap-4",
          assessorTactics.length === 1
            ? "grid-cols-1 max-w-md mx-auto"
            : assessorTactics.length === 2
            ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"
            : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        )}
      >
        {assessorTactics.map((at, index) => (
          <AssessorTacticsCard
            key={at.assessorName}
            assessorName={at.assessorName}
            tactics={at.tactics}
            colorIndex={index}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}