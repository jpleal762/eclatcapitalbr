import { ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScale } from "@/contexts/ScaleContext";
import { cn } from "@/lib/utils";

const SCALE_OPTIONS = [
  { value: 1, label: "1x" },
  { value: 1.25, label: "1.25x" },
  { value: 1.5, label: "1.5x" },
  { value: 1.75, label: "1.75x" },
  { value: 2, label: "2x" },
] as const;

export function ScaleSelector() {
  const { scaleFactor, setScaleFactor } = useScale();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Escala de visualização">
          <ZoomIn className="h-4 w-4" />
          <span className="sr-only">Escala</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover">
        {SCALE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setScaleFactor(option.value as 1 | 1.25 | 1.5 | 1.75 | 2)}
            className={cn(
              "cursor-pointer",
              scaleFactor === option.value && "bg-primary/10 text-primary font-bold"
            )}
          >
            {option.label}
            {scaleFactor === option.value && " ✓"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
