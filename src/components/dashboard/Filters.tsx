import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardFilters } from "@/types/kpi";
import { Filter } from "lucide-react";

interface FiltersProps {
  filters: DashboardFilters;
  assessors: string[];
  categories: string[];
  statuses: string[];
  onFilterChange: (filters: DashboardFilters) => void;
}

export function Filters({
  filters,
  assessors,
  categories,
  statuses,
  onFilterChange,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros:</span>
      </div>

      <Select
        value={filters.assessor}
        onValueChange={(value) => onFilterChange({ ...filters, assessor: value })}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Todos os Assessores" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Assessores</SelectItem>
          {assessors.map((a) => (
            <SelectItem key={a} value={a}>
              {a.split(" ").slice(0, 2).join(" ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category}
        onValueChange={(value) => onFilterChange({ ...filters, category: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Todas as Categorias" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as Categorias</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status}
        onValueChange={(value) => onFilterChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Todos os Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Status</SelectItem>
          {statuses.map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
