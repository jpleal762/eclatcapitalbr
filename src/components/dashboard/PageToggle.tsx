import { LayoutGrid, TrendingUp, Target, Users, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type PageType = "dashboard" | "analysis" | "sprint" | "prospection" | "tactics";

interface PageToggleProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const pageOrder: PageType[] = ["dashboard", "analysis", "sprint", "prospection", "tactics"];

const pageConfig: Record<PageType, { icon: React.ReactNode; nextTooltip: string }> = {
  dashboard: {
    icon: <LayoutGrid className="h-4 w-4" />,
    nextTooltip: "Ir para Análises",
  },
  analysis: {
    icon: <TrendingUp className="h-4 w-4" />,
    nextTooltip: "Ir para Sprint",
  },
  sprint: {
    icon: <Target className="h-4 w-4" />,
    nextTooltip: "Ir para Prospecção",
  },
  prospection: {
    icon: <Users className="h-4 w-4" />,
    nextTooltip: "Ir para Táticas",
  },
  tactics: {
    icon: <Lightbulb className="h-4 w-4" />,
    nextTooltip: "Voltar ao Dashboard",
  },
};

export function PageToggle({ currentPage, onPageChange }: PageToggleProps) {
  const currentIndex = pageOrder.indexOf(currentPage);
  const nextIndex = (currentIndex + 1) % pageOrder.length;
  const nextPage = pageOrder[nextIndex];
  const config = pageConfig[nextPage];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(nextPage)}
          className="h-8 w-8"
        >
          {config.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {pageConfig[currentPage].nextTooltip}
      </TooltipContent>
    </Tooltip>
  );
}
