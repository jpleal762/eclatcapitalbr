import { LayoutGrid, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PageToggleProps {
  currentPage: "dashboard" | "analysis";
  onPageChange: (page: "dashboard" | "analysis") => void;
}

export function PageToggle({ currentPage, onPageChange }: PageToggleProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(currentPage === "dashboard" ? "analysis" : "dashboard")}
          className="h-8 w-8"
        >
          {currentPage === "dashboard" ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {currentPage === "dashboard" ? "Ir para Análises" : "Voltar ao Dashboard"}
      </TooltipContent>
    </Tooltip>
  );
}
