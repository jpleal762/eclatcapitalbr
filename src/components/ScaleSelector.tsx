import { ZoomIn, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScale } from "@/contexts/ScaleContext";
import { cn } from "@/lib/utils";

const SCALE_OPTIONS = [
  { value: 1 as const, label: "1x" },
  { value: 1.25 as const, label: "1.25x" },
  { value: 1.5 as const, label: "1.5x" },
  { value: 1.75 as const, label: "1.75x" },
  { value: 2 as const, label: "2x" },
];

export function ScaleSelector() {
  const { scaleFactor, setScaleFactor, isTV, tvScale } = useScale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Escala de visualização">
          {isTV ? <Monitor className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
          <span className="sr-only">Escala</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        {SCALE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setScaleFactor(option.value)}
            className={cn(
              "cursor-pointer",
              scaleFactor === option.value && "bg-primary/10 text-primary font-bold"
            )}
          >
            {option.label}
            {scaleFactor === option.value && " ✓"}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setScaleFactor("tv55")}
          className={cn(
            "cursor-pointer flex items-center gap-2",
            isTV && "bg-primary/10 text-primary font-bold"
          )}
        >
          <Monitor className="h-3.5 w-3.5" />
          TV 55" ({tvScale}x)
          {isTV && " ✓"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
