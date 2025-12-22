import { LayoutDashboard, BarChart3, Settings, CheckSquare, Square } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export interface DashboardVisibility {
  card1: boolean; // ICM Geral
  card2: boolean; // Meta Semanal / Análise Anual
  card3: boolean; // ICM% por Assessor
  graph1: boolean; // Gauge Principal 1
  graph2: boolean; // Gauge Principal 2
  graph3: boolean; // Gauge Principal 3
  graph4: boolean; // Sub-gauge 4
  graph5: boolean; // Sub-gauge 5
  graph6: boolean; // Sub-gauge 6
  graph7: boolean; // Sub-gauge 7
  graph8: boolean; // Sub-gauge 8
  graph9: boolean; // Sub-gauge 9
}

export const defaultVisibility: DashboardVisibility = {
  card1: true,
  card2: true,
  card3: true,
  graph1: true,
  graph2: true,
  graph3: true,
  graph4: true,
  graph5: true,
  graph6: true,
  graph7: true,
  graph8: true,
  graph9: true,
};

interface DashboardSidebarProps {
  visibility: DashboardVisibility;
  onVisibilityChange: (key: keyof DashboardVisibility, value: boolean) => void;
}

const CARD_ITEMS: { key: keyof DashboardVisibility; label: string }[] = [
  { key: "card1", label: "Card 1 - ICM Geral" },
  { key: "card2", label: "Card 2 - Meta/Análise" },
  { key: "card3", label: "Card 3 - Ranking Assessor" },
];

const GRAPH_ITEMS: { key: keyof DashboardVisibility; label: string }[] = [
  { key: "graph1", label: "Gráfico 1 - Principal" },
  { key: "graph2", label: "Gráfico 2 - Principal" },
  { key: "graph3", label: "Gráfico 3 - Principal" },
  { key: "graph4", label: "Gráfico 4 - Sub" },
  { key: "graph5", label: "Gráfico 5 - Sub" },
  { key: "graph6", label: "Gráfico 6 - Sub" },
  { key: "graph7", label: "Gráfico 7 - Sub" },
  { key: "graph8", label: "Gráfico 8 - Sub" },
  { key: "graph9", label: "Gráfico 9 - Sub" },
];

export function DashboardSidebar({ visibility, onVisibilityChange }: DashboardSidebarProps) {
  const allSelected = Object.values(visibility).every(Boolean);
  const noneSelected = Object.values(visibility).every((v) => !v);

  const handleSelectAll = () => {
    Object.keys(visibility).forEach((key) => {
      onVisibilityChange(key as keyof DashboardVisibility, true);
    });
  };

  const handleDeselectAll = () => {
    Object.keys(visibility).forEach((key) => {
      onVisibilityChange(key as keyof DashboardVisibility, false);
    });
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="font-semibold text-foreground">Configurações</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Action Buttons */}
        <div className="p-3 space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleSelectAll}
            disabled={allSelected}
          >
            <CheckSquare className="h-4 w-4" />
            Selecionar Todos
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleDeselectAll}
            disabled={noneSelected}
          >
            <Square className="h-4 w-4" />
            Desmarcar Todos
          </Button>
        </div>

        {/* Cards Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Cards
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {CARD_ITEMS.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-md transition-colors">
                    <Checkbox
                      checked={visibility[item.key]}
                      onCheckedChange={(checked) =>
                        onVisibilityChange(item.key, checked === true)
                      }
                    />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </label>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Graphs Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Gráficos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {GRAPH_ITEMS.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <label className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/50 rounded-md transition-colors">
                    <Checkbox
                      checked={visibility[item.key]}
                      onCheckedChange={(checked) =>
                        onVisibilityChange(item.key, checked === true)
                      }
                    />
                    <span className="text-sm text-foreground">{item.label}</span>
                  </label>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
