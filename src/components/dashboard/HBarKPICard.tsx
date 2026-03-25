import {
  AlertTriangle,
  CheckCircle,
  CheckCircle2,
  CalendarCheck,
  TrendingUp,
  DollarSign,
  Coins,
  Handshake,
  BadgeCheck,
  Zap,
  PieChart,
} from "lucide-react";
import React from "react";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/kpiUtils";
import type { AssessorRemainingItem } from "./GaugeChart";

const LABEL_ICON_MAP: Record<string, React.ReactNode> = {
  "Primeiras Reuniões": <CalendarCheck className="icon-responsive-sm flex-shrink-0" />,
  "Primeira reuniao": <CalendarCheck className="icon-responsive-sm flex-shrink-0" />,
  "Primeira Reunião | Diagnóstico": <CalendarCheck className="icon-responsive-sm flex-shrink-0" />,
  "Captação NET": <TrendingUp className="icon-responsive-sm flex-shrink-0" />,
  "Captação net": <TrendingUp className="icon-responsive-sm flex-shrink-0" />,
  "Receita": <DollarSign className="icon-responsive-sm flex-shrink-0" />,
  "PJ1 XP": <DollarSign className="icon-responsive-sm flex-shrink-0" />,
  "PJ2 XP": <Coins className="icon-responsive-sm flex-shrink-0" />,
  "Parceiros Tri": <Handshake className="icon-responsive-sm flex-shrink-0" />,
  "Receita Parceiros": <Handshake className="icon-responsive-sm flex-shrink-0" />,
  "Habilitacao": <BadgeCheck className="icon-responsive-sm flex-shrink-0" />,
  "Habilitação": <BadgeCheck className="icon-responsive-sm flex-shrink-0" />,
  "Ativacao": <Zap className="icon-responsive-sm flex-shrink-0" />,
  "Ativação": <Zap className="icon-responsive-sm flex-shrink-0" />,
  "Diversificada ( ROA>1,5)": <PieChart className="icon-responsive-sm flex-shrink-0" />,
  "Diversificação": <PieChart className="icon-responsive-sm flex-shrink-0" />,
};

const getAlertType = (
  pct: number,
  ritmo?: number
): "GREEN" | "ORANGE" | "RED" | undefined => {
  if (ritmo === undefined) return undefined;
  if (pct >= ritmo) return "GREEN";
  return (ritmo - pct) / ritmo * 100 > 50 ? "RED" : "ORANGE";
};

export interface HBarKPICardProps {
  label: string;
  value: number;
  target: number;
  percentage: number;
  isCurrency?: boolean;
  ritmoIdeal?: number;
  weight?: number;
  headName?: string;
  showRemaining?: boolean;
  additionalValue?: number;
  showAssessorList?: boolean;
  assessorRemainingData?: AssessorRemainingItem[];
  assessorListLabel?: string;
  onEditProduction?: () => void;
}

export function HBarKPICard({
  label,
  value,
  target,
  percentage,
  isCurrency = false,
  ritmoIdeal,
  weight,
  headName,
  showRemaining = false,
  additionalValue,
  showAssessorList = false,
  assessorRemainingData,
  assessorListLabel,
  onEditProduction,
}: HBarKPICardProps) {
  const clampedPct = Math.min(Math.max(percentage, 0), 100);
  const remainingValue = Math.max(target - value, 0);
  const alertType = getAlertType(percentage, ritmoIdeal);
  const isOnRhythm = alertType === "GREEN";

  // Segmented bar (e.g. Receita Empilhada on top of base)
  const hasSegmented = additionalValue && additionalValue > 0;
  const baseValue = hasSegmented ? value - additionalValue : value;
  const basePct = Math.min(Math.max(target > 0 ? (baseValue / target) * 100 : 0, 0), 100);
  const addPct = Math.min(
    Math.max(target > 0 && hasSegmented ? (additionalValue / target) * 100 : 0, 0),
    100 - basePct
  );

  const borderClass = isOnRhythm
    ? "border-l-[3px] border-l-green-500"
    : alertType === "RED"
    ? "border-l-[3px] border-l-red-500"
    : alertType === "ORANGE"
    ? "border-l-[3px] border-l-orange-500"
    : "";

  const pctColor = isOnRhythm
    ? "text-green-600 dark:text-green-400"
    : alertType === "RED"
    ? "text-red-500"
    : alertType === "ORANGE"
    ? "text-orange-500"
    : "text-foreground";

  const alertIcon = (() => {
    if (alertType === "GREEN")
      return <CheckCircle className="icon-responsive-sm text-green-500 flex-shrink-0" />;
    if (alertType === "RED")
      return <AlertTriangle className="icon-responsive-sm text-red-500 animate-pulse flex-shrink-0" />;
    return null;
  })();

  return (
    <Card
      className={`p-responsive-sm shadow-card h-full flex flex-col overflow-hidden bg-card ${borderClass}`}
    >
      {/* Header: title + weight + alert icon */}
      <div className="flex items-start justify-between flex-shrink-0 mb-1">
        <div className="flex flex-col min-w-0 flex-1">
          <h4 className="text-responsive-xs font-semibold text-foreground flex items-center gap-1 min-w-0 leading-tight">
            <span className="truncate min-w-0">{label}</span>
            {LABEL_ICON_MAP[label]}
            {weight !== undefined && (
              <span className="text-responsive-4xs text-muted-foreground font-normal whitespace-nowrap flex-shrink-0">
                x{weight}
              </span>
            )}
          </h4>
          {headName && (
            <span className="text-responsive-4xs font-bold text-eclat-gold uppercase tracking-wide leading-tight">
              HEAD {headName}
            </span>
          )}
        </div>
        {alertIcon && <div className="ml-1">{alertIcon}</div>}
      </div>

      {/* Content row: bar section + optional assessor list */}
      <div
        className={`flex flex-1 min-h-0 ${
          showAssessorList ? "flex-row gap-2 items-start" : "flex-col justify-between"
        }`}
      >
        {/* Bar section */}
        <div className={`flex flex-col flex-1 min-w-0 min-h-0 ${showAssessorList ? "gap-1 justify-start" : "justify-between"}`}>
          {/* Percentage + remaining */}
          <div className="flex items-baseline justify-between gap-1 flex-shrink-0">
            <span className={`text-responsive-xl font-bold leading-none ${pctColor}`}>
              {percentage}%
            </span>
            {showRemaining && remainingValue > 0 && (
              <span className="text-responsive-4xs text-muted-foreground whitespace-nowrap">
                falta {formatNumber(remainingValue, isCurrency)}
              </span>
            )}
          </div>

          {/* Progress bar with ritmo ideal marker */}
          <div className="relative flex-shrink-0 my-1">
            <div className="h-bar-responsive-lg bg-muted rounded-full overflow-hidden">
              {/* Segmented: additional value (darker gold) */}
              {hasSegmented && (
                <div
                  className="absolute left-0 top-0 h-full"
                  style={{
                    width: `${addPct}%`,
                    background: "linear-gradient(90deg, #C9A227, #A67C00)",
                    transition: "width 0.5s ease-out",
                  }}
                />
              )}
              {/* Main progress (gold gradient) */}
              <div
                className="absolute top-0 h-full bg-eclat-gradient-horizontal rounded-full"
                style={{
                  left: hasSegmented ? `${addPct}%` : "0",
                  width: `${hasSegmented ? basePct : clampedPct}%`,
                  transition: "width 0.5s ease-out, left 0.5s ease-out",
                }}
              />
            </div>
            {/* Ritmo ideal vertical tick */}
            {ritmoIdeal !== undefined && (
              <div
                className="absolute top-[-3px] bottom-[-3px] w-[2px] rounded-full bg-foreground/50"
                style={{
                  left: `${Math.min(ritmoIdeal, 100)}%`,
                  transform: "translateX(-50%)",
                }}
              />
            )}
          </div>

          {/* Value / Target */}
          <div className="flex justify-between items-center flex-shrink-0">
            <span
              className={`text-responsive-xs font-bold ${
                onEditProduction
                  ? "cursor-pointer hover:text-eclat-gold transition-colors"
                  : ""
              }`}
              onClick={
                onEditProduction
                  ? (e) => {
                      e.stopPropagation();
                      onEditProduction();
                    }
                  : undefined
              }
            >
              {formatNumber(value, isCurrency)}
            </span>
            <span className="text-responsive-4xs text-muted-foreground">
              / {formatNumber(target, isCurrency)}
            </span>
          </div>
        </div>

        {/* Assessor list (right side, when showAssessorList) */}
        {showAssessorList && (
          <div className="w-[100px] flex flex-col flex-shrink-0 border-l border-border pl-2 h-full min-h-0">
            <p className="text-responsive-4xs text-muted-foreground mb-0.5 font-semibold truncate whitespace-nowrap flex-shrink-0">
              {assessorListLabel || "Falta p/ Assessor"}
            </p>
            <div className="flex-1 flex flex-col justify-between min-h-0">
              {(assessorRemainingData || []).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-responsive-4xs gap-1"
                >
                  <span className="font-medium truncate max-w-[50px]" title={item.name}>
                    {item.name}
                  </span>
                  {item.achieved ? (
                    <CheckCircle2 className="h-2.5 w-2.5 text-green-500 flex-shrink-0" />
                  ) : (
                    <span className="font-medium flex-shrink-0 text-responsive-4xs text-secondary-foreground">
                      {assessorListLabel
                        ? String(item.remaining)
                        : formatNumber(item.remaining, isCurrency)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
