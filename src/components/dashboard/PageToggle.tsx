import { LayoutGrid, TrendingUp, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type PageType = "dashboard" | "analysis" | "sprint";

interface PageToggleProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  allowedScreens?: PageType[];
}

const defaultPageOrder: PageType[] = ["dashboard", "analysis", "sprint"];

const pageConfig: Record<PageType, { icon: React.ReactNode; label: string }> = {
  dashboard: {
    icon: <LayoutGrid className="h-4 w-4" />,
    label: "Dashboard",
  },
  analysis: {
    icon: <TrendingUp className="h-4 w-4" />,
    label: "Análises",
  },
  sprint: {
    icon: <Target className="h-4 w-4" />,
    label: "Sprint",
  },
};

export function PageToggle({ currentPage, onPageChange, allowedScreens }: PageToggleProps) {
  // Filter page order based on allowed screens
  const pageOrder = allowedScreens 
    ? defaultPageOrder.filter(page => allowedScreens.includes(page))
    : defaultPageOrder;

  // If only one page is allowed, don't show the toggle
  if (pageOrder.length <= 1) {
    return null;
  }

  const currentIndex = pageOrder.indexOf(currentPage);
  const nextIndex = (currentIndex + 1) % pageOrder.length;
  const nextPage = pageOrder[nextIndex];
  const nextConfig = pageConfig[nextPage];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onPageChange(nextPage)}
          className="h-8 w-8"
        >
          {nextConfig.icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        Ir para {nextConfig.label}
      </TooltipContent>
    </Tooltip>
  );
}
